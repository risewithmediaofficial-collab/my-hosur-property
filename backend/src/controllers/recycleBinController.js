const User = require("../models/User");
const Property = require("../models/Property");
const Lead = require("../models/Lead");
const CustomerRequest = require("../models/CustomerRequest");
const { logActivity } = require("../services/activityLogger");

const getRecycleBinItems = async (req, res) => {
  try {
    const { type = "all", search = "" } = req.query;

    const [deletedUsers, deletedProperties, deletedLeads, deletedRequests] = await Promise.all([
      User.find({ isDeleted: true })
        .select("name email phone role status adminNotes createdAt deletedAt deletedBy deleteReason")
        .populate("deletedBy", "name email")
        .sort("-deletedAt")
        .lean(),
      Property.find({ isDeleted: true })
        .select("title price propertyType location status createdAt deletedAt deletedBy deletedWithUser deleteReason ownerId")
        .populate("deletedBy", "name email")
        .populate("ownerId", "name email phone role")
        .sort("-deletedAt")
        .lean(),
      Lead.find({ isDeleted: true })
        .populate("deletedBy", "name email")
        .populate("userId", "name email")
        .populate("propertyId", "title location")
        .sort("-deletedAt")
        .lean(),
      CustomerRequest.find({ isDeleted: true })
        .populate("deletedBy", "name email")
        .sort("-deletedAt")
        .lean(),
    ]);

    const formattedUsers = deletedUsers.map((u) => ({
      _id: u._id,
      itemType: "user",
      title: u.name,
      subtitle: u.email || u.phone || "No contact",
      badge: u.role,
      extra: u.phone ? `Phone: ${u.phone}` : "",
      createdAt: u.createdAt,
      deletedAt: u.deletedAt || u.updatedAt,
      deletedBy: u.deletedBy ? u.deletedBy.name || u.deletedBy.email : "Admin",
      deleteReason: u.deleteReason || "Moved to Recycle Bin",
      raw: u,
    }));

    const formattedProperties = deletedProperties.map((p) => ({
      _id: p._id,
      itemType: "property",
      title: p.title,
      subtitle: `Rs. ${Number(p.price || 0).toLocaleString("en-IN")} · ${p.propertyType || "Property"} · ${p.location?.city || "Hosur"}`,
      badge: p.status || "listing",
      extra: p.ownerId ? `Owner: ${p.ownerId.name || p.ownerId.email}` : "Owner N/A",
      createdAt: p.createdAt,
      deletedAt: p.deletedAt || p.updatedAt,
      deletedBy: p.deletedBy ? p.deletedBy.name || p.deletedBy.email : "Admin",
      deleteReason: p.deletedWithUser ? "Deleted with owner account" : p.deleteReason || "Moved to Recycle Bin",
      raw: p,
    }));

    const formattedLeads = deletedLeads.map((l) => ({
      _id: l._id,
      itemType: "lead",
      title: `Inquiry from ${l.userId?.name || l.contactInfo?.name || "User"}`,
      subtitle: l.propertyId?.title ? `For: ${l.propertyId.title}` : `Intent: ${l.intentType || "Contact"}`,
      badge: l.status || "lead",
      extra: l.contactInfo?.phone ? `Phone: ${l.contactInfo.phone}` : "",
      createdAt: l.createdAt,
      deletedAt: l.deletedAt || l.updatedAt,
      deletedBy: l.deletedBy ? l.deletedBy.name || l.deletedBy.email : "Admin",
      deleteReason: l.deleteReason || "Moved to Recycle Bin",
      raw: l,
    }));

    const formattedRequests = deletedRequests.map((r) => ({
      _id: r._id,
      itemType: "customer_request",
      title: `Requirement: ${r.customerName || "Customer"}`,
      subtitle: `${(r.requestCategory || "property_buy").replace(/_/g, " ")} · ${r.location?.city || "Hosur"}`,
      badge: r.status || "request",
      extra: r.contactDetails?.phone ? `Phone: ${r.contactDetails.phone}` : "",
      createdAt: r.createdAt,
      deletedAt: r.deletedAt || r.updatedAt,
      deletedBy: r.deletedBy ? r.deletedBy.name || r.deletedBy.email : "Admin",
      deleteReason: r.deleteReason || "Moved to Recycle Bin",
      raw: r,
    }));

    let allItems = [
      ...formattedUsers,
      ...formattedProperties,
      ...formattedLeads,
      ...formattedRequests,
    ].sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0));

    if (type !== "all") {
      allItems = allItems.filter((i) => i.itemType === type);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      allItems = allItems.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.subtitle?.toLowerCase().includes(q) ||
          i.extra?.toLowerCase().includes(q) ||
          i.deletedBy?.toLowerCase().includes(q)
      );
    }

    return res.json({
      items: allItems,
      counts: {
        total: formattedUsers.length + formattedProperties.length + formattedLeads.length + formattedRequests.length,
        users: formattedUsers.length,
        properties: formattedProperties.length,
        leads: formattedLeads.length,
        requests: formattedRequests.length,
      },
    });
  } catch (error) {
    console.error("[getRecycleBinItems] Error:", error);
    return res.status(500).json({ message: "Failed to fetch recycle bin items", error: error.message });
  }
};

const restoreItem = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === "user") {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found in recycle bin" });

      user.isDeleted = false;
      user.deletedAt = null;
      user.deletedBy = null;
      user.deleteReason = "";
      await user.save();

      // Restore properties that were soft deleted with this user
      await Property.updateMany(
        { ownerId: id, deletedWithUser: true },
        {
          $set: {
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            deletedWithUser: false,
          },
        }
      );

      await logActivity({
        action: "USER_RESTORED",
        entityType: "user",
        entityId: user._id,
        entityTitle: user.name,
        req,
        summary: `Admin restored user account: "${user.name}" (${user.email || user.phone}) from Recycle Bin`,
        details: { restoredUser: user.name, email: user.email, role: user.role },
      });

      return res.json({ message: `User "${user.name}" restored successfully`, item: user });
    }

    if (type === "property") {
      const property = await Property.findById(id);
      if (!property) return res.status(404).json({ message: "Property not found in recycle bin" });

      property.isDeleted = false;
      property.deletedAt = null;
      property.deletedBy = null;
      property.deletedWithUser = false;
      property.deleteReason = "";
      await property.save();

      await logActivity({
        action: "PROPERTY_RESTORED",
        entityType: "property",
        entityId: property._id,
        entityTitle: property.title,
        req,
        summary: `Admin restored property listing: "${property.title}" from Recycle Bin`,
        details: { title: property.title, price: property.price },
      });

      return res.json({ message: `Property "${property.title}" restored successfully`, item: property });
    }

    if (type === "lead") {
      const lead = await Lead.findById(id);
      if (!lead) return res.status(404).json({ message: "Lead not found in recycle bin" });

      lead.isDeleted = false;
      lead.deletedAt = null;
      lead.deletedBy = null;
      await lead.save();

      await logActivity({
        action: "LEAD_RESTORED",
        entityType: "lead",
        entityId: lead._id,
        entityTitle: `Inquiry lead (${lead.intentType})`,
        req,
        summary: `Admin restored inquiry lead from Recycle Bin`,
      });

      return res.json({ message: "Lead restored successfully", item: lead });
    }

    if (type === "customer_request") {
      const reqDoc = await CustomerRequest.findById(id);
      if (!reqDoc) return res.status(404).json({ message: "Property request not found in recycle bin" });

      reqDoc.isDeleted = false;
      reqDoc.deletedAt = null;
      reqDoc.deletedBy = null;
      await reqDoc.save();

      await logActivity({
        action: "CUSTOMER_REQUEST_RESTORED",
        entityType: "customer_request",
        entityId: reqDoc._id,
        entityTitle: reqDoc.customerName,
        req,
        summary: `Admin restored customer request for "${reqDoc.customerName}" from Recycle Bin`,
      });

      return res.json({ message: "Property request restored successfully", item: reqDoc });
    }

    return res.status(400).json({ message: `Unknown item type: ${type}` });
  } catch (error) {
    console.error("[restoreItem] Error:", error);
    return res.status(500).json({ message: "Failed to restore item", error: error.message });
  }
};

const permanentlyDeleteItem = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === "user") {
      const user = await User.findById(id);
      const userName = user?.name || id;
      await User.findByIdAndDelete(id);
      await Property.deleteMany({ ownerId: id });
      await Lead.deleteMany({ userId: id });

      await logActivity({
        action: "USER_PURGED_PERMANENT",
        entityType: "user",
        entityId: id,
        entityTitle: userName,
        req,
        summary: `Admin permanently purged user "${userName}" and associated data from database`,
      });

      return res.json({ message: `User "${userName}" permanently deleted from database` });
    }

    if (type === "property") {
      const prop = await Property.findById(id);
      const title = prop?.title || id;
      await Property.findByIdAndDelete(id);

      await logActivity({
        action: "PROPERTY_PURGED_PERMANENT",
        entityType: "property",
        entityId: id,
        entityTitle: title,
        req,
        summary: `Admin permanently purged property "${title}" from database`,
      });

      return res.json({ message: `Property "${title}" permanently deleted` });
    }

    if (type === "lead") {
      await Lead.findByIdAndDelete(id);
      await logActivity({
        action: "SYSTEM_ACTION",
        entityType: "lead",
        entityId: id,
        entityTitle: "Lead Purged",
        req,
        summary: `Admin permanently purged inquiry lead from database`,
      });
      return res.json({ message: "Inquiry lead permanently deleted" });
    }

    if (type === "customer_request") {
      await CustomerRequest.findByIdAndDelete(id);
      await logActivity({
        action: "SYSTEM_ACTION",
        entityType: "customer_request",
        entityId: id,
        entityTitle: "Customer Request Purged",
        req,
        summary: `Admin permanently purged customer request from database`,
      });
      return res.json({ message: "Customer request permanently deleted" });
    }

    return res.status(400).json({ message: `Unknown item type: ${type}` });
  } catch (error) {
    console.error("[permanentlyDeleteItem] Error:", error);
    return res.status(500).json({ message: "Failed to permanently delete item", error: error.message });
  }
};

const emptyRecycleBin = async (req, res) => {
  try {
    const { type = "all" } = req.query;
    let counts = { users: 0, properties: 0, leads: 0, requests: 0 };

    if (type === "all" || type === "user") {
      const uRes = await User.deleteMany({ isDeleted: true });
      counts.users = uRes.deletedCount || 0;
    }
    if (type === "all" || type === "property") {
      const pRes = await Property.deleteMany({ isDeleted: true });
      counts.properties = pRes.deletedCount || 0;
    }
    if (type === "all" || type === "lead") {
      const lRes = await Lead.deleteMany({ isDeleted: true });
      counts.leads = lRes.deletedCount || 0;
    }
    if (type === "all" || type === "customer_request") {
      const rRes = await CustomerRequest.deleteMany({ isDeleted: true });
      counts.requests = rRes.deletedCount || 0;
    }

    const totalPurged = counts.users + counts.properties + counts.leads + counts.requests;

    await logActivity({
      action: "RECYCLE_BIN_EMPTIED",
      entityType: "recycle_bin",
      entityId: "empty_all",
      entityTitle: "Recycle Bin Emptied",
      req,
      summary: `Admin emptied Recycle Bin: permanently purged ${totalPurged} item(s)`,
      details: counts,
    });

    return res.json({
      message: `Recycle Bin emptied. ${totalPurged} item(s) permanently removed.`,
      counts,
    });
  } catch (error) {
    console.error("[emptyRecycleBin] Error:", error);
    return res.status(500).json({ message: "Failed to empty recycle bin", error: error.message });
  }
};

module.exports = {
  getRecycleBinItems,
  restoreItem,
  permanentlyDeleteItem,
  emptyRecycleBin,
};
