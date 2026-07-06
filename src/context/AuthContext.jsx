import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('inkwell_token'));

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const fbToken = await firebaseUser.getIdToken(true);
          localStorage.setItem('inkwell_token', fbToken);
          setToken(fbToken);
          
          const regName = localStorage.getItem('inkwell_reg_name');
          const regUsername = localStorage.getItem('inkwell_reg_username');

          const { data } = await api.post('/auth/firebase', {
            name: regName || firebaseUser.displayName,
            email: firebaseUser.email,
            profilePic: firebaseUser.photoURL,
            provider: firebaseUser.providerData[0]?.providerId?.split('.')[0] || 'email',
            username: regUsername || undefined
          });
          setUser(data);

          if (regName) localStorage.removeItem('inkwell_reg_name');
          if (regUsername) localStorage.removeItem('inkwell_reg_username');
        } catch (error) {
          console.error('Error syncing user with backend', error);
          setUser(null);
          setToken(null);
          localStorage.removeItem('inkwell_token');
          localStorage.removeItem('inkwell_reg_name');
          localStorage.removeItem('inkwell_reg_username');
        }
      } else {
        localStorage.removeItem('inkwell_token');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('inkwell_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, token, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
