import {dsmLoginSetup} from '@synopackageland/cli/e2e';
dsmLoginSetup({session:'authorized',user:'authorized',timeout:240_000});
dsmLoginSetup({session:'denied',user:'denied',timeout:240_000});
