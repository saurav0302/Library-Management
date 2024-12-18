const mongoose = require('mongoose');
const bcrypt = require('bcrypt');  

// Define the User Schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    membershipType: {
        type: String,
        enum: ['Regular', 'Premium', 'Student'],
        default: 'Regular',
        required: function() {
            return this.userRole !== 'Admin';
        }
    },
    borrowedBooks: [{
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: false
        },
        title: {
            type: String,
            required: false
        }
    }],
    reserveBooks: [{
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: false
        },
        title: {
            type: String,
            required: false
        }
    }],
    membershipStartDate: {
        type: Date,
        default: Date.now
    },
    membershipEndDate: {
        type: Date,
        required: false
    },
    userRole: {
        type: String,
        enum: ['Admin', 'Librarian', 'Library Patron'],
        default: 'Library Patron'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//  Pre-save middleware
userSchema.pre('save', async function(next) {  
    try {
        // Handle Admin role and membership type
        if (this.isModified('userRole') && this.userRole === 'Admin') {
            this.membershipType = 'Premium';
        }

        // Check borrowed books limits
        if (this.isModified('membershipType') || this.isModified('borrowedBooks')) {
            if (this.membershipType === 'Regular' && this.borrowedBooks.length > 1) {
                throw new Error('You reached your limit of 1 book. Now return book and then try again.');
            }
            if (this.membershipType === 'Premium' && this.borrowedBooks.length > 5) {
                throw new Error('You reached your limit of 5 books. Now return book and then try again.');
            }
            if (this.membershipType === 'Student' && this.borrowedBooks.length > 3) {
                throw new Error('You reached your limit of 3 books. Now return book and then try again.');
            }
        }

         // Check reserve books limits (maximum 2 reserved books)
         if (this.isModified('reserveBooks') && this.reserveBooks.length > 2) {
            throw new Error('You can only reserve up to 2 books. Please cancel a reservation before reserving more.');
        }

        // Handle password hashing
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Add method to compare passwords
userSchema.methods.comparePassword = async function(userPassword) {
    try {
        return await bcrypt.compare(userPassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// Add method to check if user can borrow more books
userSchema.methods.canBorrowMore = function() {
    const limits = {
        'Regular': 1,
        'Premium': 5,
        'Student': 3
    };
    
    const currentLimit = limits[this.membershipType];
    return this.borrowedBooks.length < currentLimit;
};

// Add virtual for membership status
userSchema.virtual('membershipStatus').get(function() {
    if (!this.membershipEndDate) return 'Active';
    return Date.now() < this.membershipEndDate ? 'Active' : 'Expired';
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;