"""add guest fields to reviews

Revision ID: 1234abcd5678
Revises: (previous_revision_id)
Create Date: 2025-12-01 13:55:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1234abcd5678'
down_revision = None  # Replace with previous migration ID if any
branch_labels = None
depends_on = None

def upgrade():
    # Make user_id nullable
    with op.batch_alter_table('reviews', schema=None) as batch_op:
        batch_op.alter_column('user_id',
                           existing_type=sa.INTEGER(),
                           nullable=True)
    
    # Add guest name and email fields
    op.add_column('reviews', sa.Column('guest_name', sa.String(100), nullable=True))
    op.add_column('reviews', sa.Column('guest_email', sa.String(120), nullable=True))


def downgrade():
    # Remove guest fields
    with op.batch_alter_table('reviews', schema=None) as batch_op:
        batch_op.drop_column('guest_email')
        batch_op.drop_column('guest_name')
    
    # Make user_id required again (you'll need to handle existing NULL values first)
    # op.execute("UPDATE reviews SET user_id = 0 WHERE user_id IS NULL")  # Replace 0 with a default user ID
    # with op.batch_alter_table('reviews', schema=None) as batch_op:
    #     batch_op.alter_column('user_id',
    #                        existing_type=sa.INTEGER(),
    #                        nullable=False)
