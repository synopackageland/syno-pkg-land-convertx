import {appOpenSmoke} from '@synopackageland/cli/e2e';
import {fileURLToPath} from 'node:url';

// #dropzone is the upload area of the official ConvertX home page.
appOpenSmoke({app:fileURLToPath(new URL('../../dsm-package.yaml',import.meta.url)),ready:'#dropzone'});
