import { Injectable } from '@nestjs/common';
import {
    CategoryType,
    CreateCategoryBodyType,
    UpdateCategoryBodyType,
    GetCategoriesQueryType,
    GetCategoriesResType,
} from 'src/routes/category/category.dto';

import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CategoryRepository {
    constructor(private prismaService: PrismaService) {}

    async list(pagination: GetCategoriesQueryType): Promise<GetCategoriesResType> {
        const skip = (pagination.page - 1) * pagination.limit;
        const take = pagination.limit;
        const [totalItems, data] = await Promise.all([
            this.prismaService.category.count({
                where: {
                    deletedAt: null,
                },
            }),
            this.prismaService.category.findMany({
                where: {
                    deletedAt: null,
                },
                include: {
                    categoryTranslations: {
                        where: {
                            deletedAt: null,
                        },
                        include: {
                            language: true,
                        },
                    },
                    parentCategory: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                        },
                    },
                    childrenCategories: {
                        where: {
                            deletedAt: null,
                        },
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                        },
                    },
                },
                skip,
                take,
            }),
        ]);
        return {
            data,
            totalItems,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(totalItems / pagination.limit),
        };
    }

    findById(id: number): Promise<CategoryType | null> {
        return this.prismaService.category.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                categoryTranslations: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        language: true,
                    },
                },
                parentCategory: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
                childrenCategories: {
                    where: {
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
            },
        });
    }

    create({ createdById, data }: { createdById: number; data: CreateCategoryBodyType }): Promise<CategoryType> {
        return this.prismaService.category.create({
            data: {
                ...data,
                createdById,
            },
            include: {
                categoryTranslations: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        language: true,
                    },
                },
                parentCategory: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
                childrenCategories: {
                    where: {
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
            },
        });
    }

    update({
        id,
        updatedById,
        data,
    }: {
        id: number;
        updatedById: number;
        data: UpdateCategoryBodyType;
    }): Promise<CategoryType> {
        return this.prismaService.category.update({
            where: {
                id,
                deletedAt: null,
            },
            data: {
                ...data,
                updatedById,
            },
            include: {
                categoryTranslations: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        language: true,
                    },
                },
                parentCategory: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
                childrenCategories: {
                    where: {
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                },
            },
        });
    }

    delete(id: number, isHard?: boolean): Promise<CategoryType> {
        return isHard
            ? this.prismaService.category.delete({
                  where: {
                      id,
                  },
                  include: {
                      categoryTranslations: {
                          where: {
                              deletedAt: null,
                          },
                          include: {
                              language: true,
                          },
                      },
                      parentCategory: {
                          select: {
                              id: true,
                              name: true,
                              logo: true,
                          },
                      },
                      childrenCategories: {
                          where: {
                              deletedAt: null,
                          },
                          select: {
                              id: true,
                              name: true,
                              logo: true,
                          },
                      },
                  },
              })
            : this.prismaService.category.update({
                  where: {
                      id,
                      deletedAt: null,
                  },
                  data: {
                      deletedAt: new Date(),
                  },
                  include: {
                      categoryTranslations: {
                          where: {
                              deletedAt: null,
                          },
                          include: {
                              language: true,
                          },
                      },
                      parentCategory: {
                          select: {
                              id: true,
                              name: true,
                              logo: true,
                          },
                      },
                      childrenCategories: {
                          where: {
                              deletedAt: null,
                          },
                          select: {
                              id: true,
                              name: true,
                              logo: true,
                          },
                      },
                  },
              });
    }
}
