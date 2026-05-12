export type SqlParams = (string | number | null)[];

export type Migration = {
  id: number;
  name: string;
  up: () => Promise<void>;
};
