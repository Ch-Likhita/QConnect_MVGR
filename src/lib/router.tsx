import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext<any>(null);

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  const [path, setPath] = useState(typeof window !== 'undefined' ? window.location.pathname : '/');

  useEffect(() => {
    const handler = () => {
      if (typeof window !== 'undefined') {
        setPath(window.location.pathname);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const push = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  return React.createElement(RouterContext.Provider, { value: { path, push } }, children);
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) return { push: () => {} };
  return { push: context.push };
};

export const usePathname = () => {
  const context = useContext(RouterContext);
  return context ? context.path : (typeof window !== 'undefined' ? window.location.pathname : '/');
};

export const useParams = () => {
  const path = window.location.pathname;
  const parts = path.split('/');
  // Matches /question/[id] -> ["", "question", "123"]
  if (parts[1] === 'question' && parts[2]) return { id: parts[2] };
  // Matches /profile/[id] -> ["", "profile", "123"]
  if (parts[1] === 'profile' && parts[2]) return { id: parts[2] };
  return {};
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export const Link: React.FC<LinkProps> = ({ href, children, className, ...props }) => {
  const { push } = useRouter();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export default Link;