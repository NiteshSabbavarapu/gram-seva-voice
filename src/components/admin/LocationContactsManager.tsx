import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Location {
  id: string;
  name: string;
  type: "village" | "city";
}

interface Contact {
  id: string;
  contact_name: string;
  phone: string;
}

const LocationContactsManager = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Add/Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ contact_name: "", phone: "" });

  useEffect(() => {
    // Simple search as user types (no pagination for now)
    const fetchLocations = async () => {
      if (!query.trim()) {
        setLocations([]);
        return;
      }
      const { data } = await supabase
        .from("locations")
        .select("*")
        .ilike("name", `%${query.trim()}%`)
        .limit(10);
      setLocations(data || []);
    };
    const delay = setTimeout(fetchLocations, 350);
    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    if (selected) {
      setLoadingContacts(true);
      supabase
        .from("location_contacts")
        .select("*")
        .eq("location_id", selected.id)
        .then(({ data }) => {
          setContacts(data || []);
          setLoadingContacts(false);
        });
    } else {
      setContacts([]);
    }
  }, [selected]);

  const resetForm = () => {
    setEditId(null);
    setForm({ contact_name: "", phone: "" });
  };

  const handleEdit = (c: Contact) => {
    setEditId(c.id);
    setForm({ contact_name: c.contact_name, phone: c.phone });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("location_contacts").delete().eq("id", id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Contact deleted" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contact_name.trim() || !form.phone.trim() || !selected) return;

    if (editId) {
      // Update contact
      const { error } = await supabase
        .from("location_contacts")
        .update(form)
        .eq("id", editId);
      if (!error) {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === editId ? { ...c, ...form } : c
          )
        );
        toast({ title: "Contact updated" });
      }
    } else {
      // Insert contact
      const { data, error } = await supabase
        .from("location_contacts")
        .insert([{ ...form, location_id: selected.id }])
        .select()
        .single();
      if (!error && data) {
        setContacts((prev) => [...prev, data]);
        toast({ title: "Contact added" });
      }
    }
    resetForm();
  };

  return (
    <Card className="mb-10 bg-blue-50">
      <CardContent className="p-6">
        <h2 className="font-bold text-lg mb-4">Location Contacts Management</h2>
        <Input
          placeholder="Search for village/city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-3"
        />
        {locations.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <Button
                  key={loc.id}
                  variant={selected?.id === loc.id ? "default" : "outline"}
                  onClick={() => setSelected(loc)}
                  className="rounded"
                >
                  {loc.name} <span className="ml-2 text-xs uppercase text-gray-500">({loc.type})</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <div>
            <div className="mb-5 mt-2">
              <span className="font-semibold">{selected.name}</span>{" "}
              <span className="text-xs text-gray-500">({selected.type})</span>
            </div>
            <form className="flex gap-4 mb-4 flex-wrap" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="cname">Contact Name</Label>
                <Input
                  id="cname"
                  required
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  placeholder="E.g. Gram Panchayat Office"
                />
              </div>
              <div>
                <Label htmlFor="cphone">Phone</Label>
                <Input
                  id="cphone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div className="flex flex-col-reverse md:flex-col justify-end">
                <Button type="submit" className="h-10 mt-4">{editId ? "Update" : "Add"}</Button>
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-1 h-10"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
            <div>
              <h4 className="font-semibold mb-2">Contacts</h4>
              {loadingContacts ? (
                <div className="text-gray-500 text-sm">Loading...</div>
              ) : contacts.length === 0 ? (
                <div className="text-gray-500 text-sm">No contacts yet.</div>
              ) : (
                <ul className="space-y-2">
                  {contacts.map((c) => (
                    <li key={c.id} className="flex items-center gap-3">
                      <span>
                        <span className="font-medium">{c.contact_name}</span>
                        <span className="ml-2 text-blue-800">{c.phone}</span>
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationContactsManager;
