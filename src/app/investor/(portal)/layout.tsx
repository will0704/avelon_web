import { InvestorPortalLayout } from "@/components/investor/InvestorPortalLayout";
import { WalletProvider } from "@/providers/WalletProvider";

export default function InvestorPortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <InvestorPortalLayout>{children}</InvestorPortalLayout>
    </WalletProvider>
  );
}
