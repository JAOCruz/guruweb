import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Navigate } from "react-router-dom";

// Define types for our context
type UserRole = "admin" | "user";

type User = {
  username: string;
  role: UserRole;
  dataColumn?: string; // The column name this user has access to
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Valid credentials (hardcoded for simplicity)
const validCredentials = [
  {
    username: "admin",
    password: "password123",
    role: "admin" as UserRole,
  },
  {
    username: "hengi",
    password: "hengi123",
    role: "user" as UserRole,
    dataColumn: "HENGI",
  },
  {
    username: "marleni",
    password: "marleni123",
    role: "user" as UserRole,
    dataColumn: "MARLENI",
  },
  {
    username: "israel",
    password: "israel123",
    role: "user" as UserRole,
    dataColumn: "ISRAEL",
  },
  {
    username: "thaicar",
    password: "thaicar123",
    role: "user" as UserRole,
    dataColumn: "THAICAR",
  },
];

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setIsAdmin(parsedUser.role === "admin");
    }
  }, []);

  // Login function
  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    // In a real app, this would be an API call
    const foundUser = validCredentials.find(
      (cred) => cred.username === username && cred.password === password,
    );

    if (foundUser) {
      const user = {
        username: foundUser.username,
        role: foundUser.role,
        dataColumn: foundUser.dataColumn,
      };
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user.role === "admin");
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    }
    return false;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Protected route component
export const ProtectedRoute: React.FC<{
  children: ReactNode;
  redirectPath?: string;
}> = ({ children, redirectPath = "/login" }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Use React Router's Navigate component for redirection
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
