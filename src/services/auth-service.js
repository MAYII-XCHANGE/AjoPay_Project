import { requestData } from "../api/client";
import { clearTokens, getRefreshToken, setTokens } from "../api/token-store";

const splitName = (name = "") => {
  const [firstName = "", ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
};

export const authService = {
  async login(credentials) {
    const session = await requestData({ method: "POST", url: "/auth/login", data: credentials });
    setTokens(session);
    return session;
  },
  register({ name, firstName, lastName, email, password }) {
    const names = name ? splitName(name) : { firstName, lastName };
    return requestData({ method: "POST", url: "/auth/register", data: { ...names, email, password } });
  },
  requestRegistrationOtp(email) {
    return requestData({ method: "POST", url: "/auth/otp/request", data: { email } });
  },
  resendRegistrationOtp(email) {
    return requestData({ method: "POST", url: "/auth/otp/resend", data: { email } });
  },
  verifyRegistrationOtp(email, otp) {
    return requestData({ method: "POST", url: "/auth/otp/verify", data: { email, otp } });
  },
  requestPasswordResetOtp(email) {
    return requestData({ method: "POST", url: "/auth/password/forgot", data: { email } });
  },
  resendPasswordResetOtp(email) {
    return requestData({ method: "POST", url: "/auth/password/reset/otp", data: { email } });
  },
  confirmPasswordResetOtp(email, otp) {
    return requestData({ method: "POST", url: "/auth/password/reset/otp/confirm", data: { email, otp } });
  },
  resetPassword(email, newPassword) {
    return requestData({ method: "POST", url: "/auth/password/reset", data: { email, newPassword } });
  },
  changePassword(currentPassword, newPassword) {
    return requestData({ method: "POST", url: "/auth/password/change", data: { currentPassword, newPassword } });
  },
  profile() {
    return requestData({ method: "GET", url: "/auth/profile" });
  },
  updateProfile(profile) {
    return requestData({ method: "PATCH", url: "/auth/profile", data: profile });
  },
  async logout() {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await requestData({ method: "POST", url: "/auth/logout", data: { refreshToken } });
      }
    } finally {
      clearTokens();
    }
  },
};
