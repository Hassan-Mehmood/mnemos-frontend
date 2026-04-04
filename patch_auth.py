import re

with open("src/context/AuthContext.tsx", "r") as f:
    content = f.read()

replacement = """
const getUserFromToken = (token: string | null): User | null => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return {
            id: payload.sub,
            email: payload.email || '',
            name: payload.name || ''
        };
    } catch (e) {
        console.error("Failed to parse token", e);
        return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
    const [user, setUser] = useState<User | null>(getUserFromToken(localStorage.getItem('access_token')));

    const login = (newToken: string, newUser?: User) => {
        setToken(newToken);
        if (newUser) {
            setUser(newUser);
        } else {
            setUser(getUserFromToken(newToken));
        }
        localStorage.setItem('access_token', newToken);
    };
"""

old_auth_provider = """export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('access_token'),
    );
    const [user, setUser] = useState<User | null>(null);

    const login = (newToken: string, newUser?: User) => {
        setToken(newToken);
        if (newUser) setUser(newUser);
        localStorage.setItem('access_token', newToken);
    };"""

content = content.replace(old_auth_provider, replacement)

# write updated content
with open("src/context/AuthContext.tsx", "w") as f:
    f.write(content)
