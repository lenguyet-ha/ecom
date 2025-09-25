import { VariantsType } from './routes/product/product.dto';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace PrismaJson {
        type Variants = VariantsType;
    }
}
