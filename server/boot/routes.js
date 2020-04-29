const asyncHandler = require("../middleware/asyncHandler");

module.exports = function (app) {
  const Member = app.models.Member;
  // define custom login route
  app.post(
    "/login",
    asyncHandler(async function (req, res) {
      const accessToken = await Member.login(req.body);
      let member = await Member.findById(accessToken.userId, {
        include: { relation: "roles" },
      });
      member = member.toJSON();

      //  if user is superAdmin get all members
      if (member.username === "superAdmin") {
        member = await Member.find({
          where: { username: { neq: "superAdmin" } },
          include: {
            relation: "roles",
            scope: {
              fields: ["name"],
            },
          },
        });
      }

      return res.send({
        success: true,
        token: accessToken.id,
        member,
      });
    })
  );

  app.post(
    "/signup",
    asyncHandler(async (req, res, next) => {
      const member = await Member.create(req.body);
      return res.send({ success: true, data: member });
    })
  );

  app.post(
    "/logout",
    asyncHandler(async function (req, res, next) {
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      } else {
        token = req.body.accessToken;
      }
      await Member.logout(token);
      return res.send({ success: true, data: "user logged out successfully" });
    })
  );
};
