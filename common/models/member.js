"use strict";
const app = require("../../server/server");

module.exports = function (Member) {
  // assign admin role to users
  // access : superAdmin

  Member.makeAdmin = async function (memberCred, next) {
    // get role and role mapping
    try {
      const RoleMapping = app.models.RoleMapping;
      const Role = app.models.Role;

      // get admin role
      const adminRole = await Role.findOne({ where: { name: "Admin" } });

      // fetch member from id
      let member = await Member.findById(memberCred, {
        include: { relation: "roles" },
      });

      // fetch member by username
      if (!member) {
        member = await Member.findOne({
          where: { username: memberCred },
          include: { relation: "roles" },
        });
      }

      if (!member) {
        let err = new Error("operation failed");
        err.statusCode = 404;
        return next(err);
      }

      member = member.toJSON();
      // check user is already an Admin
      const hasAdminRole = member.roles.filter(
        (obj) => obj.name === "Admin" || obj.name === "superAdmin"
      );
      if (!hasAdminRole || hasAdminRole.length > 0) {
        let err = new Error(`${member.username} is already an Admin`);
        err.statusCode = 409;
        return next(err);
      }

      await adminRole.principals.create({
        principalType: RoleMapping.USER,
        principalId: member.id,
      });
      return next(null, `Admin Role successfully assigned to ${member.email}`);
    } catch (err) {
      return next(err);
    }
  };

  Member.remoteMethod("makeAdmin", {
    http: {
      path: "/makeAdmin",
      verb: "post",
    },
    accepts: {
      arg: "memberCred",
      type: "string",
      http: { source: "form" },
      required: true,
    },
    returns: {
      arg: "message",
      type: "string",
    },
  });
};
