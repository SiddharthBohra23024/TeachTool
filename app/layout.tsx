import "./globals.css";
import "./dev.css";
export const metadata = { title: "Tuition Manager", description: "Students, fees and WhatsApp reminders" };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
