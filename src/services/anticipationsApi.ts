import api from './api';
import { CreateAnticipationRequest, AnticipationResponse } from '../types/apiTypes';

export const createAnticipation = (
  cardId: string,
  dto: CreateAnticipationRequest
): Promise<AnticipationResponse> =>
  api.post(`/credit-cards/${cardId}/anticipations`, dto).then((r) => r.data);
