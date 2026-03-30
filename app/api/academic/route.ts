import { NextRequest, NextResponse } from "next/server";
import { AcademicService } from "@/lib/services/academic.service";
import { Department, AcademicYear, AcademicSection } from "@/lib/db/schema";

export async function GET() {
  try {
    const data = await AcademicService.getAllAcademicData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching academic data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch academic data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data, createSections, createYears, standalone } =
      await request.json();

    // Server-side validation for duplicates
    if (type === "section") {
      const isDuplicate = await AcademicService.checkDuplicateSection(
        data.name,
        data.order,
        data.departmentId,
      );
      if (isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: `Section "${data.name}" with order ${data.order} already exists in this department`,
          },
          { status: 400 },
        );
      }
    }

    if (type === "year") {
      const isDuplicate = await AcademicService.checkDuplicateYear(
        data.name,
        data.order,
        data.departmentId,
      );
      if (isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: `Year "${data.name}" with order ${data.order} already exists in this department`,
          },
          { status: 400 },
        );
      }
    }

    let result;
    switch (type) {
      case "department": {
        result = await AcademicService.createDepartment(data);

        // Auto-create A, B, C sections if requested
        if (createSections && result.id) {
          await AcademicService.createStandaloneSections(result.id);
        }

        // Auto-create default years if requested
        if (createYears && result.id) {
          await AcademicService.createDefaultYears(result.id);
        }
        break;
      }
      case "year": {
        result = await AcademicService.createAcademicYear(data);

        // Auto-create A, B, C sections if requested
        if (createSections && result.id) {
          await AcademicService.createDefaultSections(data.departmentId);
        }
        break;
      }
      case "section": {
        result = await AcademicService.createAcademicSection(data);
        break;
      }
      default:
        throw new Error("Invalid type");
    }

    const allData = await AcademicService.getAllAcademicData();
    return NextResponse.json({
      success: true,
      data: allData,
    });
  } catch (error) {
    console.error("Error creating academic record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create record" },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { type, id, data } = await request.json();

    // Server-side validation for duplicates
    if (type === "section") {
      const isDuplicate = await AcademicService.checkDuplicateSection(
        data.name,
        data.order,
        data.departmentId,
        id, // Exclude current record from duplicate check
      );
      if (isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: `Section "${data.name}" with order ${data.order} already exists in this department`,
          },
          { status: 400 },
        );
      }
    }

    if (type === "year") {
      const isDuplicate = await AcademicService.checkDuplicateYear(
        data.name,
        data.order,
        data.departmentId,
        id, // Exclude current record from duplicate check
      );
      if (isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            error: `Year "${data.name}" with order ${data.order} already exists in this department`,
          },
          { status: 400 },
        );
      }
    }

    let result;
    switch (type) {
      case "department": {
        result = await AcademicService.updateDepartment(id, data);
        break;
      }
      case "year": {
        result = await AcademicService.updateAcademicYear(id, data);
        break;
      }
      case "section": {
        result = await AcademicService.updateAcademicSection(id, data);
        break;
      }
      default:
        throw new Error("Invalid type");
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Record not found" },
        { status: 404 },
      );
    }

    const allData = await AcademicService.getAllAcademicData();
    return NextResponse.json({
      success: true,
      data: allData,
    });
  } catch (error) {
    console.error("Error updating academic record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update record" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { type, id } = await request.json();

    let success;
    switch (type) {
      case "department": {
        success = await AcademicService.deleteDepartment(id);
        break;
      }
      case "year": {
        success = await AcademicService.deleteAcademicYear(id);
        break;
      }
      case "section": {
        success = await AcademicService.deleteAcademicSection(id);
        break;
      }
      default:
        throw new Error("Invalid type");
    }

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Record not found" },
        { status: 404 },
      );
    }

    const allData = await AcademicService.getAllAcademicData();
    return NextResponse.json({
      success: true,
      data: allData,
    });
  } catch (error) {
    console.error("Error deleting academic record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete record" },
      { status: 400 },
    );
  }
}
