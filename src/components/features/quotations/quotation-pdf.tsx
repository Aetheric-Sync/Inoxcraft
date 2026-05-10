import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Prisma } from "@prisma/client";

import { formatNaira } from "@/lib/utils/money";

// Define the full type based on repository include
export type QuotationWithFullDetails = Prisma.QuotationGetPayload<{
  include: {
    project: {
      include: {
        customer: true;
        materials: { include: { material: true } };
      };
    };
    createdBy: { select: { name: true } };
  };
}>;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#334155",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#156648",
  },
  tagline: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  refSection: {
    alignItems: "flex-end",
  },
  refTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#156648",
  },
  dateInfo: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e293b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    gap: 40,
  },
  gridCol: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#1e293b",
    marginBottom: 6,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    padding: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#f1f5f9",
    padding: 6,
  },
  col1: { flex: 3 }, // Material name
  col2: { flex: 1, textAlign: "center" }, // Unit
  col3: { flex: 1, textAlign: "center" }, // Qty
  col4: { flex: 1.5, textAlign: "right" }, // Unit price
  col5: { flex: 1.5, textAlign: "right" }, // Total
  breakdown: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
    width: 200,
  },
  breakdownLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 10,
    color: "#64748b",
  },
  breakdownValue: {
    width: 80,
    textAlign: "right",
    color: "#1e293b",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 8,
    borderTop: 1,
    borderTopColor: "#e2e8f0",
    width: 200,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
    paddingRight: 10,
    color: "#1e293b",
  },
  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
    width: 100,
    textAlign: "right",
    color: "#156648",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTop: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    fontSize: 8,
    color: "#94a3b8",
  },
});

export function QuotationPDF({ quotation }: { quotation: QuotationWithFullDetails }) {
  const { project } = quotation;
  const { customer } = project;
  const dims = project.dimensionsMm as { l: number; w: number; h: number };

  // Calculate material subtotal for profit display
  const materialSubtotal = project.materials.reduce((acc, m) => {
    return acc + Number(m.quantity) * m.unitCostKobo;
  }, 0);

  return (
    <Document title={`Quotation ${quotation.reference}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>HAKEEM&apos;S INOXCRAFT</Text>
            <Text style={styles.tagline}>Professional Stainless Steel Fabrication</Text>
          </View>
          <View style={styles.refSection}>
            <Text style={styles.refTitle}>{quotation.reference}</Text>
            <Text style={styles.dateInfo}>
              Issued: {new Date(quotation.createdAt).toLocaleDateString("en-NG")}
            </Text>
            <Text style={styles.dateInfo}>
              Valid until: {new Date(quotation.validUntil).toLocaleDateString("en-NG")}
            </Text>
          </View>
        </View>

        {/* Customer & Project */}
        <View style={styles.grid}>
          <View style={styles.gridCol}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{customer.name}</Text>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{customer.phone ?? "N/A"}</Text>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{customer.email ?? "N/A"}</Text>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{customer.address ?? "N/A"}</Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.sectionTitle}>Project Details</Text>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{project.projectType}</Text>
            <Text style={styles.label}>Complexity</Text>
            <Text style={styles.value}>{project.complexity.toUpperCase()}</Text>
            <Text style={styles.label}>Dimensions (L×W×H)</Text>
            <Text style={styles.value}>
              {dims.l}mm × {dims.w}mm × {dims.h}mm
            </Text>
          </View>
        </View>

        {/* Materials Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Material</Text>
              <Text style={styles.col2}>Unit</Text>
              <Text style={styles.col3}>Qty</Text>
              <Text style={styles.col4}>Unit Price</Text>
              <Text style={styles.col5}>Total</Text>
            </View>
            {project.materials.map((m) => (
              <View key={m.id} style={styles.tableRow}>
                <Text style={styles.col1}>{m.material.name}</Text>
                <Text style={styles.col2}>{m.material.unitType}</Text>
                <Text style={styles.col3}>{Number(m.quantity)}</Text>
                <Text style={styles.col4}>{formatNaira(m.unitCostKobo)}</Text>
                <Text style={styles.col5}>{formatNaira(Number(m.quantity) * m.unitCostKobo)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cost Summary */}
        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Materials Subtotal</Text>
            <Text style={styles.breakdownValue}>{formatNaira(materialSubtotal)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Labour Cost</Text>
            <Text style={styles.breakdownValue}>{formatNaira(project.labourCostKobo)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Transport Cost</Text>
            <Text style={styles.breakdownValue}>{formatNaira(project.transportCostKobo)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Profit Margin ({project.profitMarginPct}%)</Text>
            <Text style={styles.breakdownValue}>
              {formatNaira(
                quotation.totalAmountKobo -
                  (project.labourCostKobo + project.transportCostKobo + materialSubtotal),
              )}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalValue}>{formatNaira(quotation.totalAmountKobo)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This quotation is valid for 30 days. HAKEEM&apos;S INOXCRAFT.
            {"\n"}Professional Stainless Steel & Iron Fabrication.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
