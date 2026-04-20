// Generic address type
// So users can type in a address which will be converted to map coordinates.
export type AddressInput = {
  country: string;
  region?: string;
  city: string;
  postalCode: string;
  street: string;
};
