export interface ApiEnvelope<T> {
  data: T;
  meta: { count?: number };
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  status: number;
  code: string;
  message: string;
  details?: FieldError[];
  requestId?: string;
}
