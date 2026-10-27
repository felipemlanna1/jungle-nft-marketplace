import type { InputHTMLAttributes } from 'react';
import type { Network, Wallet, WalletType } from '../../contracts';
export interface AuthFormProps {
  register: boolean;
}
export interface AuthSearch {
  redirect?: string;
  favorite?: string;
}
export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hideLabel?: boolean;
}
export interface AccountSidebarProps {
  active: 'profile' | 'wallets';
}
export interface ProfileFormValues {
  name: string;
  username: string;
  email: string;
  ens: string;
  walletNickname: string;
  avatar: string;
}
export interface WalletFormValues {
  displayName: string;
  label: string;
  profileName: string;
  address: string;
  secondaryAddress: string;
  network: Network;
  walletType: WalletType | '';
  referralCode: string;
  email: string;
  ens: string;
}
export interface WalletEditor {
  wallet: Wallet | null;
  primary: boolean;
}

export interface WalletFieldsProps {
  values: WalletFormValues;
  setField: <K extends keyof WalletFormValues>(field: K, value: WalletFormValues[K]) => void;
}
export interface EnsFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}
export interface SocialOptionsProps {
  onSelect: (provider: string) => void;
}

export interface ProfileChange {
  owner: string;
  values: ProfileFormValues;
}
export interface WalletChange {
  owner: string;
  wallet: Partial<Wallet>;
}
export interface PasswordChange {
  owner: string;
  current: string;
  password: string;
}
