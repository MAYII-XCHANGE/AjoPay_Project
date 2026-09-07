import { useQuery } from "@tanstack/react-query";
import { walletService } from "../services/wallet-service";

export function useBankAccounts(options = {}) {
  return useQuery({
    queryKey: ["wallet-bank-accounts"],
    queryFn: walletService.getBankAccounts,
    ...options,
  });
}
