import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

// Initialize the Supabase Client if credentials are provided
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// ============================================================================
// Cryptographic Utility for Secure Offline/Client-side Fallback
// (Guarantees passwords are NEVER stored in plain-text)
// ============================================================================
async function hashPassword(password, salt = 'finagent_salt_2026') {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const data = enc.encode(`${salt}:${password}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Basic deterministic fallback if SubtleCrypto is unavailable
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem('finagent_auth_accounts');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredUsers(users) {
  try {
    localStorage.setItem('finagent_auth_accounts', JSON.stringify(users));
  } catch (err) {
    console.warn('Failed saving accounts:', err);
  }
}

// ============================================================================
// Supabase Authentication Service (with seamless fallback)
// ============================================================================
export const supabaseAuth = {
  /**
   * Sign up a new user with email, password, and full name.
   */
  async signUp({ name, email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: cleanName,
            full_name: cleanName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const user = data.user
        ? {
            user_id: data.user.id,
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
          }
        : null;

      return {
        user,
        session: data.session,
        needsEmailConfirmation: !data.session,
        message: data.session
          ? 'Account created and authenticated successfully!'
          : 'Account created! Please check your email to verify your account or sign in.',
      };
    }

    // Secure local cryptographic auth fallback
    const users = getStoredUsers();
    if (users[cleanEmail]) {
      throw new Error('This email is already registered. Please sign in instead.');
    }

    const salt = `salt_${Date.now()}`;
    const passwordHash = await hashPassword(password, salt);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newUserRecord = {
      id: userId,
      user_id: userId,
      name: cleanName,
      email: cleanEmail,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users[cleanEmail] = newUserRecord;
    saveStoredUsers(users);

    const safeUser = {
      id: userId,
      user_id: userId,
      name: cleanName,
      email: cleanEmail,
    };

    const token = `fa_jwt_${btoa(`${userId}:${Date.now()}`)}`;

    return {
      user: safeUser,
      token,
      session: { access_token: token, user: safeUser },
      message: 'Account created successfully! Welcome to FinAgent.',
    };
  },

  /**
   * Log in an existing user with email and password.
   */
  async signIn({ email, password, rememberMe = true }) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please verify your credentials.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in.');
        }
        throw new Error(error.message);
      }

      const user = {
        user_id: data.user.id,
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        email: cleanEmail,
      };

      return {
        user,
        session: data.session,
        token: data.session.access_token,
        message: 'Signed in successfully!',
      };
    }

    // Secure local cryptographic auth fallback
    const users = getStoredUsers();
    const account = users[cleanEmail];

    if (!account) {
      throw new Error('Invalid email or password. No account found with this email.');
    }

    const computedHash = await hashPassword(password, account.salt);
    if (computedHash !== account.passwordHash) {
      throw new Error('Invalid email or password. Please check your password and try again.');
    }

    const safeUser = {
      id: account.id,
      user_id: account.user_id,
      name: account.name,
      email: account.email,
    };

    const token = `fa_jwt_${btoa(`${account.id}:${Date.now()}`)}`;

    return {
      user: safeUser,
      token,
      session: { access_token: token, user: safeUser },
      message: 'Signed in successfully!',
    };
  },

  /**
   * Log out the active session.
   */
  async signOut() {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
  },

  /**
   * Retrieve active session and user.
   */
  async getSession() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return null;

      const user = data.session.user;
      return {
        token: data.session.access_token,
        user: {
          id: user.id,
          user_id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0],
          email: user.email,
        },
      };
    }
    return null;
  },

  /**
   * Listen to auth state transitions.
   */
  onAuthStateChange(callback) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          const user = {
            id: session.user.id,
            user_id: session.user.id,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            email: session.user.email,
          };
          callback(event, { user, token: session.access_token });
        } else {
          callback(event, null);
        }
      });
      return () => subscription.unsubscribe();
    }
    return () => {};
  },
};
