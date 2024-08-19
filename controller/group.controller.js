import query from "../helper/query.helper.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { socketConnected,io } from "../socket/socket.js";

export const createGroup = asyncHandler(async (req, res) => {

  const groupName = req.body.group;
  const user = req.user;
  const groupMember = [...req.body.groupMember, user.id];
  let queryStr;

  // console.log("groupName,Member:", groupName, groupMember);

  try {
    queryStr = `INSERT INTO groups (name, admin, type) VALUES ('${groupName}', ${user.id}, group);`;

    const { insertId: id } = await query(queryStr);

    console.log("id:", id);

    queryStr = `INSERT INTO group_members (user_id, group_id) VALUES ;`.split('');

    groupMember?.forEach((item, index) => {
      if (index == groupMember.length - 1)
        queryStr.splice(-1, 0, `(${item},${id})`);
      else
        queryStr.splice(-1, 0, `(${item},${id}),`);
    })

    queryStr = queryStr.join('');

    const createdGrp = await query(queryStr);

    res.status(200).json({ message: "Group has been created!" });

  } catch (error) {
    throw new ApiError(500, "something went worng while creating group!");
  }
})

export const SendMsgGrp = asyncHandler(async (req, res) => {

  const senderId = req.user.id;
  const groupId = req.params.id;
  const message = req.body.message;
  let queryStr;

  try {
    queryStr = `INSERT INTO groupmessages (SenderId, GroupId, Message)
        VALUES (${senderId}, ${groupId}, '${message}');`

    const { insertId: MessageId } = await query(queryStr);

    queryStr = ` INSERT INTO groupconversations (MessageId, GroupId)
        VALUES (${MessageId}, ${groupId});`

    await query(queryStr);

    queryStr = `SELECT
    gm.*,users.FULL_NAME,users.USER_NAME 
    FROM groupmessages AS gm JOIN users on gm.SenderId = users.id WHERE gm.id = ${MessageId};`

    const MessageForResponse = await query(queryStr);

    const forItself = socketConnected[senderId];

    forItself && io.to(forItself).emit("receive-message",MessageForResponse);

    res.status(200).json({ message: MessageForResponse });

  } catch (error) {
    console.log("ERROR:", error);
    throw new ApiError(500, "Something went worng while sending message in group")
  }
})

export const getMessage = asyncHandler(async (req, res) => {
  try {
    const groupId = req.params.id;

    const queryStr = `SELECT
    gm.*,
    users.FULL_NAME,
    users.USER_NAME
    FROM
    groupmessages AS gm
    JOIN groupconversations AS gc
    ON
    gm.id = gc.MessageId
    JOIN groups ON groups.id = gc.GroupId
    JOIN users ON gm.SenderId = users.id
    WHERE
    groups.id = ${groupId};`;

    const getGrpMsg = await query(queryStr);

    // console.log(getGrpMsg);

    res.status(200).json({ message: getGrpMsg.reverse() });

  } catch (error) {
    throw new ApiError(500, "something went worng while fetching group message!")
  }
})

export const getAllGroup = asyncHandler(async (req, res) => {

  const queryStr = `SELECT
    groups.id,
    groups.name as groupName,
    groups.type,
    users.FULL_NAME AS admin,
    users.USER_NAME AS admin_username,
    users.EMAIL,
    gm.user_id
FROM
    groups
JOIN users ON groups.admin = users.id
JOIN group_members AS gm
ON
    groups.id = gm.group_id
WHERE
    groups.admin = users.id AND groups.id = gm.group_id;`

  try {
    const AllGroup = await query(queryStr);

    const ModifiedGroup = [];
    AllGroup.map((item) => {

      let i;
      const test = ModifiedGroup.some((data, index) => {
        i = index;
        return data.id === item.id
      })

      if (test) {
        ModifiedGroup[i] = { ...item, user_id: [...ModifiedGroup[i].user_id, item.user_id] }
      } else {
        ModifiedGroup.push({ ...item, user_id: [item.user_id] })
      }

      i = null;
    })
    // console.log("AllGroup:",ModifiedGroup);
    res.status(200).json({ groups: ModifiedGroup });
  } catch (error) {
    console.log("error:",error);
    throw new ApiError(500, 'something went worng while fetching groups')
  }
})