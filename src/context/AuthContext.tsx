import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, loginWithGoogleRedirect, checkRedirectResult, logoutUser } from '../firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  authError: string | null;
  login: () => Promise<void>;
  loginWithRedirectMode: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if coming back from redirect sign-in
    checkRedirectResult()
      .then((redirectUser) => {
        if (redirectUser) {
          setUser({
            uid: redirectUser.uid,
            email: redirectUser.email,
            displayName: redirectUser.displayName,
            photoURL: redirectUser.photoURL,
            isGuest: false,
          });
          localStorage.removeItem('moneydb_guest_mode');
        }
      })
      .catch((err) => {
        console.warn('Redirect result error:', err);
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isGuest: false,
          });
          localStorage.removeItem('moneydb_guest_mode');
        } else {
          // Check if guest mode is preserved
          const isGuest = localStorage.getItem('moneydb_guest_mode') === 'true';
          if (isGuest) {
            setUser({
              uid: 'guest_user',
              email: 'guest@moneydb.local',
              displayName: 'ผู้ใช้งานทั่วไป (Guest)',
              photoURL: null,
              isGuest: true,
            });
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const parseAuthError = (err: any) => {
    console.error('Login failed:', err);
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    if (err?.code === 'auth/unauthorized-domain') {
      return `โดเมน "${currentHost}" ยังไม่ได้รับอนุญาตใน Firebase Authentication โปรดไปที่ Firebase Console > Authentication > Settings > Authorized domains แล้วเพิ่ม "${currentHost}" หรือกดปุ่ม "เข้าใช้งานทันที (โหมดทดลองใช้)" ด้านล่าง`;
    } else if (err?.code === 'auth/popup-blocked') {
      return 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้ หรือเลือกใช้งานผ่าน "โหมดทดลองใช้" ได้ทันที';
    } else if (err?.code === 'auth/cancelled-popup-request' || err?.code === 'auth/popup-closed-by-user') {
      return 'หน้าต่างเข้าสู่ระบบถูกปิดก่อนดำเนินการเสร็จสิ้น กรุณาลองใหม่อีกครั้ง';
    } else if (err?.code === 'auth/operation-not-allowed') {
      return 'ระบบ Google Sign-in ยังไม่ได้เปิดใช้งานใน Firebase Console > Authentication > Sign-in method';
    } else if (err?.code === 'auth/network-request-failed') {
      return 'การเชื่อมต่อเครือข่ายขัดข้อง กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง';
    }
    return err?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google';
  };

  const login = async () => {
    try {
      setAuthError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(parseAuthError(err));
    }
  };

  const loginWithRedirectMode = async () => {
    try {
      setAuthError(null);
      await loginWithGoogleRedirect();
    } catch (err: any) {
      setAuthError(parseAuthError(err));
    }
  };

  const loginAsGuest = () => {
    localStorage.setItem('moneydb_guest_mode', 'true');
    setUser({
      uid: 'guest_user',
      email: 'guest@moneydb.local',
      displayName: 'ผู้ใช้งานทั่วไป (Guest)',
      photoURL: null,
      isGuest: true,
    });
    setAuthError(null);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('moneydb_guest_mode');
      setUser(null);
      await logoutUser();
    } catch (err: any) {
      console.error('Logout failed:', err);
      setAuthError(err?.message || 'เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        loginWithRedirectMode,
        loginAsGuest,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
