import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {title:"GulfFlow AI | Intelligent Business Operations",description:"AI-powered business operations for Qatar and the GCC"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
