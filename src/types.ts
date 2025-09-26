import { ProductTranslationType } from './routes/product/product-translation/product-translation.dto';
import { VariantsType } from './routes/product/product.dto';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace PrismaJson {
        type Variants = VariantsType;
    }
    type ProductTranslations = Pick<ProductTranslationType, 'id' | 'name' | 'description' | 'languageId'>[];
    type Receiver = {
        name: string;
        phone: string;
        address: string;
    };
}
