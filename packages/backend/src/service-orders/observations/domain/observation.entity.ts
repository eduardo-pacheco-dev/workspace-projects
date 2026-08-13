export interface ObservationProps {
  id?: number;
  serviceOrderId: number;
  title: string;
  description?: string | null;
  position?: number;
  filename?: string | null;
  originalName?: string | null;
  mimetype?: string | null;
  size?: number | null;
  createdAt?: Date;
}

export class ServiceOrderObservation {
  id?: number;
  serviceOrderId: number;
  title: string;
  description?: string | null;
  position: number;
  filename?: string | null;
  originalName?: string | null;
  mimetype?: string | null;
  size?: number | null;
  createdAt?: Date;

  constructor(props: ObservationProps) {
    Object.assign(this, { position: 0, ...props });
  }
}
