
export interface HRCheckinServiceStats {
  completed: number;
  pending: number;
}

export interface CreateCheckinParams {
  checkinData: any;
  userId: string;
}
