"use client";

import * as React from "react";

export type DashUser = { name: string; email: string };
const Ctx = React.createContext<DashUser>({ name: "", email: "" });
export const UserProvider = ({ user, children }: { user: DashUser; children: React.ReactNode }) => <Ctx.Provider value={user}>{children}</Ctx.Provider>;
export const useUser = () => React.useContext(Ctx);
