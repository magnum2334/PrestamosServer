import { Controller } from '@nestjs/common';
import { JopService } from './jop.service';

@Controller('jop')
export class JopController {
  constructor(private readonly jopService: JopService) {}
}
