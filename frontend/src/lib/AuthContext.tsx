import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  getStoredUser,
  getCurrentUser,
  clearToken,
  login as apiLogin,
  LoginResponse,
} from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user on mount
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      // Verify token is still valid
      getCurrentUser()
        .then((freshUser) => {
          setUser(freshUser);
        })
        .catch(() => {
          // Token invalid, clear everything
          clearToken();
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const freshUser = await getCurrentUser();
      setUser(freshUser);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
