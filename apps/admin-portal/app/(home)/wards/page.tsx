"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusCircle, Search, MapPin, Loader2, Award } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { axiosInstance } from "@/app/lib/axios";

const ONDO_LGAS = [
  "Akoko North-East",
  "Akoko North-West",
  "Akoko South-East",
  "Akoko South-West",
  "Akure North",
  "Akure South",
  "Ese Odo",
  "Idanre",
  "Ifedore",
  "Ilaje",
  "Ile Oluji/Okeigbo",
  "Irele",
  "Odigbo",
  "Ondo East",
  "Ondo West",
  "Ose",
  "Owo"
];

const CreateWardSchema = z.object({
  name: z.string().min(2, "Ward name must be at least 2 characters"),
  code: z.string().min(2, "Ward code must be at least 2 characters"),
  lgaName: z.string().min(1, "Please select a Local Government Area"),
});

type Ward = {
  id: string;
  name: string;
  code: string;
  lgaName: string;
  createdAt: string;
};

export default function WardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lgaFilter, setLgaFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof CreateWardSchema>>({
    resolver: zodResolver(CreateWardSchema),
    defaultValues: {
      name: "",
      code: "",
      lgaName: "",
    },
  });

  const fetchWards = async () => {
    try {
      const res = await axiosInstance.get("/ward/list");
      if (res.data && res.data.success) {
        setWards(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching wards:", err);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const onSubmit = (values: z.infer<typeof CreateWardSchema>) => {
    startTransition(async () => {
      try {
        const res = await axiosInstance.post("/ward/create", values);
        if (res.data && res.data.success) {
          toast.success("Ward created and mapped successfully!");
          form.reset();
          fetchWards();
        }
      } catch (err: any) {
        console.error("Ward creation error:", err);
        toast.error(err.response?.data?.message || "Failed to create ward.");
      }
    });
  };

  const filteredWards = wards.filter((ward) => {
    const matchesSearch =
      ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLga = lgaFilter === "ALL" || ward.lgaName === lgaFilter;
    return matchesSearch && matchesLga;
  });

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary tracking-wider uppercase">Geography & Jurisdiction</span>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Local Wards Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Map specific wards under their respective Local Government Areas (LGAs) for regional polling telemetry.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Create Ward Form */}
        <Card className="lg:col-span-5 bg-white border border-slate-100 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="text-primary size-5" />
              Create Ward
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Add a new ward and associate it with an LGA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="lgaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Government Area (LGA)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Select LGA" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ONDO_LGAS.map((lga) => (
                            <SelectItem key={lga} value={lga}>
                              {lga}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Akure South I"
                          className="bg-slate-50 border-slate-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. AKR-01"
                          className="bg-slate-50 border-slate-200 font-mono uppercase"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full flex items-center justify-center gap-1.5" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Register Ward"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Wards Directory list */}
        <Card className="lg:col-span-7 bg-white border border-slate-100 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="text-primary size-5" />
              Registered Wards Directory ({filteredWards.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Inspect current geopolitical mapping of jurisdictions across Ondo State.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Search and LGA filters */}
            <div className="p-4 bg-slate-50/50 border-y border-slate-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search ward name or code..."
                  className="pl-9 bg-white border-slate-200 text-sm"
                />
              </div>
              <select
                value={lgaFilter}
                onChange={(e) => setLgaFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All LGAs</option>
                {ONDO_LGAS.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-600">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3 px-4 font-bold">LGA Name</th>
                    <th className="py-3 px-4 font-bold">Ward Name</th>
                    <th className="py-3 px-4 font-bold">Ward Code</th>
                    <th className="py-3 px-4 font-bold">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWards.length > 0 ? (
                    filteredWards.map((ward) => (
                      <tr key={ward.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{ward.lgaName}</td>
                        <td className="py-3.5 px-4 text-slate-700">{ward.name}</td>
                        <td className="py-3.5 px-4 font-mono text-xs">{ward.code}</td>
                        <td className="py-3.5 px-4 text-xs">
                          {new Date(ward.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No wards registered under the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
