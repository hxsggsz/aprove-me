import { AddPayable } from './paybles/add-payable';
import { SendNotification } from './paybles/send-notification';

export const queueConsumers = [AddPayable, SendNotification];
