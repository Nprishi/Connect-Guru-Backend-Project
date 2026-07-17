import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category, CategoryDocument } from '../schema/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    return this.categoryModel.create(dto);
  }

  async getCategories(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.categoryModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments(),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCategoryById(categoryId: string) {
    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    return category;
  }

  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(
      categoryId,
      { $set: dto },
      { new: true },
    );

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryModel.findByIdAndDelete(categoryId).exec();
    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return { success: true, message: 'Category deleted successfully.' };
  }
}
