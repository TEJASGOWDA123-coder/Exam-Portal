import { db } from "@/lib/db";
import { departments, academicYears, academicSections } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  Department,
  AcademicYear,
  AcademicSection,
  NewDepartment,
  NewAcademicYear,
  NewAcademicSection,
} from "@/lib/db/schema";
import { randomUUID } from "crypto";

export class AcademicService {
  // Department operations
  static async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  static async getDepartmentById(id: string): Promise<Department | null> {
    const result = await db
      .select()
      .from(departments)
      .where(eq(departments.id, id));
    return result[0] || null;
  }

  static async createDepartment(data: NewDepartment): Promise<Department> {
    const result = await db
      .insert(departments)
      .values({ ...data, id: randomUUID() })
      .returning();
    return result[0];
  }

  static async updateDepartment(
    id: string,
    data: Partial<NewDepartment>,
  ): Promise<Department | null> {
    const result = await db
      .update(departments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return result[0] || null;
  }

  static async deleteDepartment(id: string): Promise<boolean> {
    const result = await db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();
    return result.length > 0;
  }

  // Academic Year operations
  static async getAcademicYears(
    departmentId?: string,
  ): Promise<AcademicYear[]> {
    if (departmentId) {
      return await db
        .select()
        .from(academicYears)
        .where(eq(academicYears.departmentId, departmentId));
    }
    return await db.select().from(academicYears);
  }

  static async getAcademicYearById(id: string): Promise<AcademicYear | null> {
    const result = await db
      .select()
      .from(academicYears)
      .where(eq(academicYears.id, id));
    return result[0] || null;
  }

  static async createAcademicYear(
    data: NewAcademicYear,
  ): Promise<AcademicYear> {
    const result = await db
      .insert(academicYears)
      .values({ ...data, id: randomUUID() })
      .returning();
    return result[0];
  }

  static async updateAcademicYear(
    id: string,
    data: Partial<NewAcademicYear>,
  ): Promise<AcademicYear | null> {
    const result = await db
      .update(academicYears)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(academicYears.id, id))
      .returning();
    return result[0] || null;
  }

  static async deleteAcademicYear(id: string): Promise<boolean> {
    const result = await db
      .delete(academicYears)
      .where(eq(academicYears.id, id))
      .returning();
    return result.length > 0;
  }

  // Academic Section operations
  static async getAcademicSections(
    departmentId?: string,
  ): Promise<AcademicSection[]> {
    if (departmentId) {
      return await db
        .select()
        .from(academicSections)
        .where(eq(academicSections.departmentId, departmentId));
    }

    return await db.select().from(academicSections);
  }

  static async getAcademicSectionById(
    id: string,
  ): Promise<AcademicSection | null> {
    const result = await db
      .select()
      .from(academicSections)
      .where(eq(academicSections.id, id));
    return result[0] || null;
  }

  static async createAcademicSection(
    data: Omit<NewAcademicSection, "yearId">,
  ): Promise<AcademicSection> {
    const result = await db
      .insert(academicSections)
      .values({
        ...data,
        id: randomUUID(),
      })
      .returning();
    return result[0];
  }

  static async updateAcademicSection(
    id: string,
    data: Partial<Omit<NewAcademicSection, "yearId">>,
  ): Promise<AcademicSection | null> {
    const result = await db
      .update(academicSections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(academicSections.id, id))
      .returning();
    return result[0] || null;
  }

  static async deleteAcademicSection(id: string): Promise<boolean> {
    const result = await db
      .delete(academicSections)
      .where(eq(academicSections.id, id))
      .returning();
    return result.length > 0;
  }

  static async createDefaultSections(departmentId: string): Promise<void> {
    const defaultSections = ["A", "B", "C"];

    for (let i = 0; i < defaultSections.length; i++) {
      const sectionName = defaultSections[i];
      await db.insert(academicSections).values({
        id: randomUUID(),
        name: sectionName,
        order: i + 1,
        departmentId,
      });
    }
  }

  static async createStandaloneSections(departmentId: string): Promise<void> {
    const defaultSections = ["A", "B", "C"];

    for (let i = 0; i < defaultSections.length; i++) {
      const sectionName = defaultSections[i];
      await db.insert(academicSections).values({
        id: randomUUID(),
        name: sectionName,
        order: i + 1,
        departmentId,
      });
    }
  }

  static async createDefaultYears(departmentId: string): Promise<void> {
    // Check if years already exist for this department
    const existingYears = await this.getAcademicYears(departmentId);
    if (existingYears.length > 0) {
      return; // Don't create if years already exist
    }

    const defaultYears = [
      { name: "1st Year", order: 1 },
      { name: "2nd Year", order: 2 },
      { name: "3rd Year", order: 3 },
    ];

    for (const year of defaultYears) {
      await db.insert(academicYears).values({
        id: randomUUID(),
        name: year.name,
        order: year.order,
        departmentId,
      });
    }
  }

  // Get all academic data for the API
  static async getAllAcademicData() {
    const [deptList, yearsList, sectionsList] = await Promise.all([
      this.getDepartments(),
      this.getAcademicYears(),
      this.getAcademicSections(),
    ]);

    return {
      departments: deptList,
      years: yearsList,
      sections: sectionsList,
    };
  }

  // Validation methods for server-side duplicate checking
  static async checkDuplicateSection(
    name: string,
    order: number,
    departmentId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const existingSections = await this.getAcademicSections(departmentId);
    return existingSections.some(
      (section) =>
        section.name.toLowerCase() === name.toLowerCase() &&
        section.order === order &&
        section.id !== excludeId,
    );
  }

  static async checkDuplicateYear(
    name: string,
    order: number,
    departmentId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const existingYears = await this.getAcademicYears(departmentId);
    return existingYears.some(
      (year) =>
        year.name.toLowerCase() === name.toLowerCase() &&
        year.order === order &&
        year.id !== excludeId,
    );
  }
}
