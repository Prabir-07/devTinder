const mongoose = require('mongoose');

const connectionSchema =  new mongoose.Schema({
        senderId : {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required: true
        },
        receiverId : {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required: true,
        },
        
        status : {
            type: String,
            required: true,
            enum: {
                values: ['interested', 'ignored', 'accepted', 'rejected'],
                message: '{VALUE} is not a valid status'
            }
        }

    },

    { timestamps: true }
)

connectionSchema.index({ senderId: 1, receiverId: 1 });


const ConnectionModel = mongoose.model('ConnectionRequest', connectionSchema);

module.exports = {
    Connection : ConnectionModel,
    connectionSchema : connectionSchema,
}