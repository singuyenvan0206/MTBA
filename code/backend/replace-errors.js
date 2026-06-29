const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.ts', { cwd: 'c:/Users/Tai/tttn/code/backend' });

for (const file of files) {
  const fullPath = path.join('c:/Users/Tai/tttn/code/backend', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('ErrorMessage')) {
    // Auth replacements
    content = content.replace(/ErrorMessage\.AUTH_INVALID_CREDENTIALS/g, 'ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS');
    content = content.replace(/ErrorMessage\.AUTH_NO_USER_INFO/g, 'ERROR_MESSAGES.AUTH.NO_USER_INFO');
    content = content.replace(/ErrorMessage\.AUTH_FORBIDDEN/g, 'ERROR_MESSAGES.AUTH.FORBIDDEN');

    // Booking replacements
    content = content.replace(/ErrorMessage\.SEAT_REQUIRED/g, 'ERROR_MESSAGES.BOOKING.SEAT_REQUIRED');
    content = content.replace(/ErrorMessage\.SEAT_LIMIT_EXCEEDED/g, 'ERROR_MESSAGES.BOOKING.SEAT_LIMIT_EXCEEDED');
    content = content.replace(/ErrorMessage\.SHOWTIME_NOT_FOUND/g, 'ERROR_MESSAGES.BOOKING.SHOWTIME_NOT_FOUND');
    content = content.replace(/ErrorMessage\.SHOWTIME_CLOSED/g, 'ERROR_MESSAGES.BOOKING.SHOWTIME_CLOSED');
    content = content.replace(/ErrorMessage\.BOOKING_NOT_FOUND/g, 'ERROR_MESSAGES.BOOKING.NOT_FOUND');
    content = content.replace(/ErrorMessage\.BOOKING_PAID_CANNOT_DELETE/g, 'ERROR_MESSAGES.BOOKING.PAID_CANNOT_DELETE');
    content = content.replace(/ErrorMessage\.BOOKING_PAID_CANNOT_CANCEL/g, 'ERROR_MESSAGES.BOOKING.PAID_CANNOT_CANCEL');
    content = content.replace(/ErrorMessage\.NO_CANCEL_PERMISSION/g, 'ERROR_MESSAGES.BOOKING.NO_CANCEL_PERMISSION');
    content = content.replace(/ErrorMessage\.DUPLICATE_PENDING_BOOKING/g, 'ERROR_MESSAGES.BOOKING.DUPLICATE_PENDING_BOOKING');

    // User replacements
    content = content.replace(/ErrorMessage\.USER_BLOCKED/g, 'ERROR_MESSAGES.USER.BLOCKED');
    content = content.replace(/ErrorMessage\.USER_VIEW_OTHER/g, 'ERROR_MESSAGES.USER.VIEW_OTHER');
    content = content.replace(/ErrorMessage\.USER_UPDATE_OTHER/g, 'ERROR_MESSAGES.USER.UPDATE_OTHER');
    content = content.replace(/ErrorMessage\.BOOKING_CREATE_FOR_OTHER/g, 'ERROR_MESSAGES.BOOKING.CREATE_FOR_OTHER_USER');
    content = content.replace(/ErrorMessage\.BOOKING_VIEW_OTHER_LIST/g, 'ERROR_MESSAGES.BOOKING.VIEW_OTHER_USER_BOOKINGS');
    content = content.replace(/ErrorMessage\.BOOKING_VIEW_OTHER_DETAILS/g, 'ERROR_MESSAGES.BOOKING.VIEW_OTHER_USER_BOOKING_DETAIL');

    // Payment replacements
    content = content.replace(/ErrorMessage\.PAYMENT_BOOKING_NOT_FOUND/g, 'ERROR_MESSAGES.PAYMENT.BOOKING_NOT_FOUND');
    content = content.replace(/ErrorMessage\.PAYMENT_ALREADY_PAID/g, 'ERROR_MESSAGES.PAYMENT.ALREADY_PAID');
    content = content.replace(/ErrorMessage\.PAYMENT_EXPIRED/g, 'ERROR_MESSAGES.PAYMENT.EXPIRED');
    content = content.replace(/ErrorMessage\.PAYMENT_AMOUNT_MISMATCH/g, 'ERROR_MESSAGES.PAYMENT.AMOUNT_MISMATCH');
    content = content.replace(/ErrorMessage\.PAYMENT_SEATS_TAKEN/g, 'ERROR_MESSAGES.PAYMENT.SEATS_TAKEN');

    // Update imports
    content = content.replace(/import \{ ErrorMessage \} from '\.\.\/common\/error-messages\.enum';\r?\n/g, '');
    content = content.replace(/import \{ ErrorMessage \} from '\.\/error-messages\.enum';\r?\n/g, '');
    
    // Some files might now lack ERROR_MESSAGES import
    if (!content.includes('ERROR_MESSAGES')) {
      // Skip
    }

    fs.writeFileSync(fullPath, content);
    console.log('Updated', file);
  }
}
