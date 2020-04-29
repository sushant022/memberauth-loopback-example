module.exports = async (app) => {
  const Member = app.models.Member;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;
  try {
    // create SuperAdmin member
    const member = await Member.create({
      username: "superAdmin",
      email: "superAdmin@test.com",
      password: "abc123ABC",
    });

    //create SuperAdmin and Admin roles
    const roles = await Role.create([
      {
        name: "superAdmin",
      },
      {
        name: "Admin",
      },
    ]);

    // assign superAdmin role to superAdmin user

    await roles[0].principals.create({
      principalType: RoleMapping.USER,
      principalId: member.id,
    });

    console.log("superAdmin role created");
  } catch (err) {
    console.log(err);
  }
};
