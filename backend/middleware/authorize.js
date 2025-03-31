const Role = require('../models/permissions_model');


// const roles = [
//     {
//       _id: 'Admin',
//       permissions: ['read', 'write', 'manage_users', 'delete']
//     },
//     {
//       _id: 'Educator',
//       permissions: ['read', 'write', 'create_workspace']
//     },
//     {
//       _id: 'Student',
//       permissions: ['read', 'submit',]
//     }
//   ];

// function initializeRoles() {
//     roles.forEach(async role => {
//       const existingRole = await Role.findById(role._id);
//       if (!existingRole) {
//         const newRole = new Role(role);
//         await newRole.save();
//         console.log(`Role ${role._id} created`);
//       }
//     });
// }


function checkPermission(requiredPermission) {
    return async (req, res, next) => {
      try {
        console.log("USER", req.user.user_role);
        const role = req.user.user_role;
        // const role = await Role.findOne({req.user.user_role});
        console.log("Role:", role);
        if (!role) {
          return res.status(403).json({ error: "Role not found" });
      }

        if (role && role.permissions.includes(requiredPermission)) {
          next();
        }
        else {
          return res.status(403).json({error: "You do not have permission to perform this action"});
        }
      }
      catch (e) {
        console.error(e);
        return res.status(401).json({error: "Access Denied"});
      }

    };
}

module.exports = checkPermission;
