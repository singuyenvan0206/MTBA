const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.controller.ts', { cwd: 'c:/Users/Tai/tttn/code/backend' });

for (const file of files) {
  const fullPath = path.join('c:/Users/Tai/tttn/code/backend', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('UserRole')) {
    content = content.replace(/import \{ UserRole \} from '\.\.\/auth\/roles\.enum';/g, "import { Role } from '../common/enums/role.enum';");
    content = content.replace(/UserRole\.ADMIN/g, 'Role.ADMIN');
    content = content.replace(/UserRole\.USER/g, 'Role.USER');
    content = content.replace(/UserRole\.STAFF/g, 'Role.STAFF');
    fs.writeFileSync(fullPath, content);
    console.log('Updated', file);
  }
}
