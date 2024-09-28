import { type ReactNode, createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";


export type UserData = {
    id: string;
    name: string;
    avatarUrl: string;
    token: string;
}

type UserContexProps = {
    getUserInfo: (githubCode: string) => Promise<void>;
    userData: UserData;
    logout: () => void;
}

type UserProviverProps = {
    children: ReactNode;
}

export const userLocalStorageKey = `${import.meta.env.VITE_LOCALSTORAGE_KEY}:userData`

const UserContext = createContext<UserContexProps>({} as UserContexProps)

export function UserProvider({ children }: UserProviverProps) {
    const [userData, setUserData] = useState<UserData>({} as UserData)

    function putUserData(data: UserData) {
        setUserData(data)

        localStorage.setItem(userLocalStorageKey, JSON.stringify(data))
    }

    async function getUserInfo(githubCode: string) {
        const { data } = await api.get<UserData>('/auth/callback', {
            params: {
                code: githubCode
            }
        })

        putUserData(data)
    }

    async function loadUserData() {
        const localData = localStorage.getItem(userLocalStorageKey)

        if (localData) {
            setUserData(JSON.parse(localData) as UserData)
        }
    }

    async function logout() {
        setUserData({} as UserData)

        localStorage.removeItem(userLocalStorageKey)
    }

    useEffect(() => {
        loadUserData();
    }, [])

    return (
        <UserContext.Provider value={{ userData, getUserInfo, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)

    if (!context) {
        throw new Error('useUser must be used with UserContext.')
    }

    return context
}