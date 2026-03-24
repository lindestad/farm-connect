import {
  useCallback,
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Linking from "expo-linking";
import type { Session, User } from "@supabase/supabase-js";

import {
  fetchProfile,
  normalizeFullName,
  normalizeProfileRole,
  type ProfileRole,
  type UserProfile,
  upsertProfileFromUser,
} from "../lib/profiles";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type AuthLinkStatus = "idle" | "processing" | "success" | "error";

type SignUpResult = {
  needsEmailConfirmation: boolean;
};

type SignUpProfileDetails = {
  fullName: string;
  role: ProfileRole;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  isLoading: boolean;
  authLinkStatus: AuthLinkStatus;
  authLinkMessage: string | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    email: string,
    password: string,
    details: SignUpProfileDetails,
  ) => Promise<SignUpResult>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthLinkState: () => void;
  makeEmailRedirectUrl: () => string;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const createRedirectUrl = () => Linking.createURL("/auth/confirm");

const parseUrlParams = (url: string) => {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);
  const hash = parsedUrl.hash.startsWith("#")
    ? parsedUrl.hash.slice(1)
    : parsedUrl.hash;

  if (hash) {
    const hashParams = new URLSearchParams(hash);
    hashParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });
  }

  return Object.fromEntries(params.entries());
};

const normalizeEmailLinkType = (value?: string) => {
  if (!value || value === "signup" || value === "magiclink") {
    return "email";
  }

  if (
    value === "email" ||
    value === "recovery" ||
    value === "invite" ||
    value === "email_change"
  ) {
    return value;
  }

  return "email";
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLinkStatus, setAuthLinkStatus] = useState<AuthLinkStatus>("idle");
  const [authLinkMessage, setAuthLinkMessage] = useState<string | null>(null);

  const syncProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError(null);

      const existingProfile = await fetchProfile(nextUser.id);
      const nextProfile =
        existingProfile ?? (await upsertProfileFromUser(nextUser));

      setProfile(nextProfile);
    } catch (error) {
      setProfile(null);
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to load the FarmConnect profile.",
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const supabaseClient = supabase;
    let isMounted = true;

    const handleAuthUrl = async (url: string) => {
      try {
        setAuthLinkStatus("processing");
        setAuthLinkMessage("Processing authentication link...");

        const params = parseUrlParams(url);
        const errorMessage =
          params.error_description ?? params.error ?? params.error_code;

        if (errorMessage) {
          throw new Error(errorMessage);
        }

        if (params.access_token && params.refresh_token) {
          const { error } = await supabaseClient.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });

          if (error) {
            throw error;
          }

          if (isMounted) {
            setAuthLinkStatus("success");
            setAuthLinkMessage(
              "Email confirmed. Your session is now active on this device.",
            );
          }
          return;
        }

        if (params.code) {
          const { error } = await supabaseClient.auth.exchangeCodeForSession(
            params.code,
          );

          if (error) {
            throw error;
          }

          if (isMounted) {
            setAuthLinkStatus("success");
            setAuthLinkMessage(
              "Authentication completed successfully. You can continue into the app.",
            );
          }
          return;
        }

        if (params.token_hash) {
          const { error } = await supabaseClient.auth.verifyOtp({
            token_hash: params.token_hash,
            type: normalizeEmailLinkType(params.type),
          });

          if (error) {
            throw error;
          }

          if (isMounted) {
            setAuthLinkStatus("success");
            setAuthLinkMessage(
              "Email confirmed. Your account is ready to use.",
            );
          }
          return;
        }

        if (isMounted) {
          setAuthLinkStatus("idle");
          setAuthLinkMessage(null);
        }
      } catch (error) {
        if (isMounted) {
          setAuthLinkStatus("error");
          setAuthLinkMessage(
            error instanceof Error
              ? error.message
              : "Unable to complete authentication from the incoming link.",
          );
        }
      }
    };

    const bootstrapSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) {
        if (isMounted) {
          setAuthLinkStatus("error");
          setAuthLinkMessage(error.message);
        }
      } else {
        if (isMounted) {
          setSession(data.session ?? null);
        }

        await syncProfile(data.session?.user ?? null);
      }

      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleAuthUrl(initialUrl);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    void bootstrapSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession ?? null);
      }

      void syncProfile(nextSession?.user ?? null);
    });

    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      void handleAuthUrl(url);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [syncProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      profileLoading,
      profileError,
      isLoading,
      authLinkStatus,
      authLinkMessage,
      async signInWithPassword(email, password) {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
      },
      async signUpWithPassword(email, password, details) {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: createRedirectUrl(),
            data: {
              full_name: normalizeFullName(details.fullName),
              role: normalizeProfileRole(details.role),
            },
          },
        });

        if (error) {
          throw error;
        }

        return {
          needsEmailConfirmation: !data.session,
        };
      },
      async resendConfirmationEmail(email) {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const { error } = await supabase.auth.resend({
          type: "signup",
          email,
          options: {
            emailRedirectTo: createRedirectUrl(),
          },
        });

        if (error) {
          throw error;
        }
      },
      async signOut() {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }
      },
      clearAuthLinkState() {
        setAuthLinkStatus("idle");
        setAuthLinkMessage(null);
      },
      makeEmailRedirectUrl() {
        return createRedirectUrl();
      },
      async refreshProfile() {
        await syncProfile(session?.user ?? null);
      },
    }),
    [
      authLinkMessage,
      authLinkStatus,
      isLoading,
      profile,
      profileError,
      profileLoading,
      session,
      syncProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
