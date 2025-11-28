import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    return (
        <div className="container py-12 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

            <div className="grid gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Get in Touch</h2>
                    <p className="text-muted-foreground">
                        Have questions about our products or your order? We're here to help.
                        Fill out the form below or reach out to us directly.
                    </p>

                    <div className="mt-4">
                        <p className="font-medium">Adamson University</p>
                        <p className="text-muted-foreground">900 San Marcelino Street, Ermita</p>
                        <p className="text-muted-foreground">Manila, 1000 Metro Manila</p>
                        <p className="text-muted-foreground mt-2">Email: store@adamson.edu.ph</p>
                        <p className="text-muted-foreground">Phone: (02) 8524 2011</p>
                    </div>
                </div>

                <div className="rounded-lg border p-6 bg-card">
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="first-name" className="text-sm font-medium">First name</label>
                                <Input id="first-name" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="last-name" className="text-sm font-medium">Last name</label>
                                <Input id="last-name" placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" type="email" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium">Message</label>
                            <Textarea id="message" placeholder="How can we help you?" className="min-h-[120px]" />
                        </div>
                        <Button className="w-full">Send Message</Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
