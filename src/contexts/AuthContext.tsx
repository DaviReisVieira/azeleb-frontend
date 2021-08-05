import {
  createContext,
  Dispatch,
  ReactChild,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import Router from "next/router";
import { recoverUserInformation } from "../services/auth";
import { api } from "../services/api";
import LoadingBox from "../components/LoadingBox";

export type User = {
  name: string;
  username: string;
  avatar_url: string;
};

export interface SignInData {
  username: string;
  password: string;
}

export interface SignUpData extends SignInData {
  name: string;
}

type AuthContextType = {
  setLoading: Dispatch<SetStateAction<boolean>>;
  user: User;
  isAuthenticated: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logOut: () => Promise<void>;
};

interface AuthProviderProps {
  children: ReactChild;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const { "nextAuth.accessToken": accessToken } = parseCookies();

    if (accessToken) {
      recoverUserInformation().then((response) => {
        setUser(response.user);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  async function signIn({ username, password }: SignInData) {
    try {
      const response = await api.post("/auth/signin", {
        username,
        password,
      });
      const { accessToken, user } = response.data;

      setCookie(undefined, "nextAuth.accessToken", accessToken, {
        maxAge: 60 * 60 * 1, // 1 hour
      });

      api.defaults.headers["Authorization"] = `Bearer ${accessToken}`;

      setUser(user);
      Router.push("/dashboard");
    } catch (error) {
      return error.response;
    }
  }

  async function signUp({ username, password, name }: SignUpData) {
    try {
      await api.post("/auth/signup", {
        username,
        password,
        name,
      });

      await signIn({ username, password });
      // Router.push("/");
    } catch (error) {
      return error.response;
    }
  }

  async function logOut() {
    setLoading(true);

    destroyCookie(undefined, "nextAuth.accessToken");

    setLoading(false);
    Router.push("");
  }

  if (loading) {
    return <LoadingBox />;
  } else {
    return (
      <AuthContext.Provider
        value={
          {
            setLoading,
            user,
            isAuthenticated,
            signIn,
            signUp,
            logOut,
          } as AuthContextType
        }
      >
        {children}
      </AuthContext.Provider>
    );
  }
}
