import psycopg2

# === USER: Fill in your database connection details here ===
DB_HOST = 'localhost'
DB_PORT = 5432
DB_NAME = 'your_db_name'
DB_USER = 'your_db_user'
DB_PASSWORD = 'your_db_password'

# Supervisor numbers (paste your list here)
supervisor_numbers = [
    '8101001','8101002','8101003','8101004','8101005','8101006','8101007','8101008','8101009','8101010','8101011','8101012',
    '8102001','8102002','8102003','8102004','8102005','8102006','8102007','8102008','8102009','8102010','8102011','8102012','8102013','8102014','8102015','8102016','8102017','8102018','8102019','8102020','8102021','8102022','8102023',
    '8108001','8108002','8108003','8108004','8108005','8108006','8108007','8108008','8108009','8108010','8108011',
    '8108001','8108002','8108003','8108004','8108005','8108006','8108007','8108008','8108009','8108010',
    '8111001','8111002','8111003','8111004','8111005','8111006','8111007','8111008','8111009','8111010','8111011','8111012',
    '8113001','8113002','8113003','8113004','8113005','8113006','8113007','8113008','8113009','8113010','8113011',
    '8113001','8113002','8113003','8113004','8113005','8113006','8113007','8113008','8113009','8113010','8113011','8113012','8113013','8113014','8113015','8113016',
    '8113001','8113002','8113003','8113004','8113005','8113006','8113007','8113008','8113009','8113010','8113011','8113012','8113013','8113014','8113015','8113016',
    '8113001','8113002','8113003','8113004','8113005','8113006','8113007','8113008','8113009','8113010','8113011','8113012','8113013','8113014','8113015','8113016',
    '8113001','8113002','8113003','8113004','8113005','8113006','8113007','8113008','8113009','8113010',
    '8113001','8113002','8113003','8113004','8113005','8113006','8113007','8113008','8113009','8113010','8113011','8113012','8113013','8113014',
    '8113001','8113002','8113003','8113004','8113005','8113006','8113007','8113008','8113009',
    '8114001','8114002','8114003','8114004','8114005','8114006','8114007','8114008',
    '8114001','8114002','8114003','8114004','8114005','8114006','8114007','8114008','8114009','8114010'
]

# Output SQL file
OUTPUT_SQL = 'insert_supervisors.sql'

def main():
    # Connect to the database
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cur = conn.cursor()

    # Fetch all mandal locations (type 'city' or 'village'), ordered by name
    cur.execute("""
        SELECT id, name FROM public.locations
        WHERE type = 'city' OR type = 'village'
        ORDER BY name
    """)
    mandals = cur.fetchall()

    if len(mandals) != len(supervisor_numbers):
        print(f"WARNING: Number of mandals ({len(mandals)}) does not match number of supervisor numbers ({len(supervisor_numbers)})!")

    # Write SQL file
    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write('-- Delete all complaints and supervisor contacts\n')
        f.write('DELETE FROM public.complaints;\n')
        f.write('DELETE FROM public.location_contacts;\n\n')
        f.write('-- Insert new supervisor contacts\n')
        for (mandal, supervisor) in zip(mandals, supervisor_numbers):
            location_id, name = mandal
            sql = f"INSERT INTO public.location_contacts (location_id, contact_name, phone) VALUES ('{location_id}', 'Mandal Supervisor', '{supervisor}');\n"
            f.write(sql)
    print(f"SQL file '{OUTPUT_SQL}' generated successfully.")

if __name__ == '__main__':
    main() 