
export interface UserAttributes {
  id: string;
  name: string;
  device_info: Record<string, any>; // This can store any key-value pair
}