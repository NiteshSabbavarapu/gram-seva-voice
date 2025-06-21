declare module "@/constants/telangana_structure.json" {
  const value: Array<{
    district: string;
    mandals: Array<{
      mandal: string;
      villages: string[];
    }>;
  }>;
  export default value;
} 