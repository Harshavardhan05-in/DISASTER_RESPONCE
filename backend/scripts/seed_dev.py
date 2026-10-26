import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from sqlalchemy import select
from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.incident import (
    IncidentReport, IncidentStatus, IncidentCategory, IncidentSeverity, IncidentStatusHistory
)
from app.models.alert import OfficialAlert, AlertSource, AlertSeverity
from app.models.emergency_service import EmergencyService, ServiceType
from app.models.shelter import Shelter, ShelterStatus
from app.models.resource import ResourceCategory, ResourceInventory
from app.models.ngo import NGO


async def seed():
    print("🌱 Seeding Disaster Response 360 development data...")

    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        existing_admin = await db.scalar(select(User).where(User.email == "admin@dr360.local"))
        if existing_admin:
            print("Database already contains seed data. Skipping.")
            return

        now = datetime.now(timezone.utc)

        # ─── 1. Users ─────────────────────────────────────────────────────────
        users = [
            User(
                email="admin@dr360.local",
                full_name="Chief Disaster Administrator",
                hashed_password=get_password_hash("AdminPass123!"),
                role=UserRole.platform_admin,
                is_active=True,
                is_verified=True,
                preferred_language="en",
            ),
            User(
                email="operator@dr360.local",
                full_name="Emergency Operations Controller",
                hashed_password=get_password_hash("OperatorPass123!"),
                role=UserRole.dept_operator,
                is_active=True,
                is_verified=True,
                preferred_language="en",
            ),
            User(
                email="responder@dr360.local",
                full_name="Field Rescue Commander",
                hashed_password=get_password_hash("ResponderPass123!"),
                role=UserRole.field_responder,
                is_active=True,
                is_verified=True,
                preferred_language="en",
            ),
            User(
                email="citizen@dr360.local",
                full_name="Priya Sharma",
                phone="+91 98765 43210",
                hashed_password=get_password_hash("CitizenPass123!"),
                role=UserRole.citizen,
                is_active=True,
                is_verified=True,
                preferred_language="en",
            ),
        ]
        db.add_all(users)
        await db.flush()

        admin_user = users[0]
        citizen_user = users[3]

        # ─── 2. Emergency Services ────────────────────────────────────────────
        services = [
            EmergencyService(
                name="Central Emergency Response Support (ERSS)",
                service_type=ServiceType.other,
                phone_primary="112",
                phone_emergency="112",
                address="Telangana State Police Headquarters, Lakdikapul",
                district="Hyderabad",
                state="Telangana",
                latitude=17.4062,
                longitude=78.4691,
                is_24_7=True,
                is_active=True,
            ),
            EmergencyService(
                name="Hyderabad Disaster Response & Fire Services",
                service_type=ServiceType.fire,
                phone_primary="101",
                phone_secondary="040-23442944",
                address="State Fire Control Room, Secretariat Road",
                district="Hyderabad",
                state="Telangana",
                latitude=17.4093,
                longitude=78.4719,
                is_24_7=True,
                is_active=True,
            ),
            EmergencyService(
                name="Osmania General Hospital — Emergency Trauma Center",
                service_type=ServiceType.hospital,
                phone_primary="040-24600121",
                phone_emergency="040-24600122",
                address="Afzal Gunj, Hyderabad",
                district="Hyderabad",
                state="Telangana",
                latitude=17.3776,
                longitude=78.4770,
                is_24_7=True,
                is_active=True,
            ),
            EmergencyService(
                name="GVK EMRI 108 Emergency Medical Ambulance",
                service_type=ServiceType.ambulance,
                phone_primary="108",
                phone_emergency="108",
                address="Devar Yamjal, Medchal Road",
                district="Medchal-Malkajgiri",
                state="Telangana",
                latitude=17.5532,
                longitude=78.5082,
                is_24_7=True,
                is_active=True,
            ),
            EmergencyService(
                name="GHMC Disaster Response Force (DRF) Control",
                service_type=ServiceType.disaster_mgmt,
                phone_primary="040-29555500",
                phone_emergency="9000113667",
                address="Command Control Center, Banjara Hills",
                district="Hyderabad",
                state="Telangana",
                latitude=17.4156,
                longitude=78.4357,
                is_24_7=True,
                is_active=True,
            ),
        ]
        db.add_all(services)

        # ─── 3. Shelters ──────────────────────────────────────────────────────
        shelters = [
            Shelter(
                name="Gachibowli Indoor Stadium Evacuation Center",
                shelter_type="Government Sports Complex",
                address="Old Mumbai Highway, Gachibowli",
                district="Hyderabad",
                state="Telangana",
                latitude=17.4435,
                longitude=78.3489,
                total_capacity=1200,
                current_occupancy=140,
                is_accessible=True,
                amenities=["Medical Post", "Drinking Water", "Sanitation", "Emergency Power", "Food Distribution"],
                contact_person="Ramesh Kumar (Camp Officer)",
                contact_phone="+91 94401 23456",
                official_designation="Primary Cyclone & Flood Refuge",
                designation_authority="District Collectorate Hyderabad",
                status=ShelterStatus.open,
                is_active=True,
                is_verified=True,
            ),
            Shelter(
                name="Secunderabad Community Relief Camp",
                shelter_type="Civic Community Hall",
                address="Near Clock Tower, MG Road, Secunderabad",
                district="Hyderabad",
                state="Telangana",
                latitude=17.4399,
                longitude=78.4983,
                total_capacity=450,
                current_occupancy=65,
                is_accessible=True,
                amenities=["Food Kitchen", "Clean Water", "First Aid"],
                contact_person="S. Sunitha (Supervisor)",
                contact_phone="+91 98480 11223",
                status=ShelterStatus.open,
                is_active=True,
                is_verified=True,
            ),
            Shelter(
                name="Uppal Municipal High School Shelter",
                shelter_type="Educational Institution",
                address="Inner Ring Road, Uppal",
                district="Medchal-Malkajgiri",
                state="Telangana",
                latitude=17.4018,
                longitude=78.5602,
                total_capacity=300,
                current_occupancy=0,
                is_accessible=False,
                amenities=["Drinking Water", "Restrooms"],
                status=ShelterStatus.open,
                is_active=True,
                is_verified=True,
            ),
        ]
        db.add_all(shelters)

        # ─── 4. Official Alerts (Demo Labeled) ────────────────────────────────
        alerts = [
            OfficialAlert(
                source=AlertSource.imd,
                title="[DEMO] Heavy Rainfall and Flash Flood Warning — Hyderabad & Ranga Reddy",
                description=(
                    "Under the influence of deep depression over Bay of Bengal, intense spells of heavy rainfall "
                    "(7-11 cm) accompanied by gusty winds (35-45 kmph) are likely across urban Hyderabad. "
                    "Low-lying areas may experience waterlogging. Citizens are advised to restrict movement."
                ),
                category="rainfall",
                severity=AlertSeverity.warning,
                affected_area="Greater Hyderabad Municipal Corporation (GHMC) limits and adjoining mandals",
                state="Telangana",
                district="Hyderabad",
                latitude=17.3850,
                longitude=78.4867,
                issuing_authority="India Meteorological Department (IMD) - Meteorological Centre Hyderabad",
                issued_at=now - timedelta(hours=3),
                expires_at=now + timedelta(hours=21),
                source_url="https://mausam.imd.gov.in/",
                is_active=True,
                is_expired=False,
                last_fetched_at=now,
            ),
            OfficialAlert(
                source=AlertSource.state_govt,
                title="[DEMO] High Heat Index Advisory — Coastal Andhra & Rayalaseema",
                description=(
                    "Extreme temperatures reaching 43°C with humidity over 65% expected. Heat Index may cross 48°C. "
                    "Stay hydrated and avoid direct sunlight exposure between 11:30 AM and 3:30 PM."
                ),
                category="heat",
                severity=AlertSeverity.advisory,
                affected_area="Vijayawada, Guntur, Nellore, Tirupati districts",
                state="Andhra Pradesh",
                district="Krishna",
                latitude=16.5062,
                longitude=80.6480,
                issuing_authority="Andhra Pradesh State Disaster Management Authority (APSDMA)",
                issued_at=now - timedelta(hours=6),
                expires_at=now + timedelta(hours=18),
                is_active=True,
                is_expired=False,
                last_fetched_at=now,
            ),
        ]
        db.add_all(alerts)

        # ─── 5. Relief Inventory Categories & Stock ───────────────────────────
        cat_water = ResourceCategory(name="Drinking Water", description="Packaged purified potable water", unit="Liters")
        cat_food = ResourceCategory(name="Ready-to-Eat Food Kits", description="High-energy non-perishable food ration packets", unit="Kits")
        cat_medical = ResourceCategory(name="Trauma & First Aid Kits", description="Sterile gauze, antiseptics, bandages, splints", unit="Boxes")
        cat_boats = ResourceCategory(name="Inflatable Rescue Boats", description="Motorized dinghies with life jackets", unit="Boats")
        db.add_all([cat_water, cat_food, cat_medical, cat_boats])
        await db.flush()

        inventories = [
            ResourceInventory(
                category_id=cat_water.id,
                location_name="Sanathnagar Central Warehouse",
                location_type="Central Depot",
                quantity_available=25000,
                quantity_reserved=5000,
                quantity_total=30000,
                district="Hyderabad",
                state="Telangana",
                latitude=17.4587,
                longitude=78.4389,
                last_updated_at=now,
            ),
            ResourceInventory(
                category_id=cat_food.id,
                location_name="Begumpet Disaster Logistics Base",
                location_type="Airport Staging Hub",
                quantity_available=8500,
                quantity_reserved=1200,
                quantity_total=9700,
                district="Hyderabad",
                state="Telangana",
                latitude=17.4452,
                longitude=78.4682,
                last_updated_at=now,
            ),
            ResourceInventory(
                category_id=cat_boats.id,
                location_name="Hussain Sagar DRF Boat Depot",
                location_type="Waterfront Rescue Station",
                quantity_available=14,
                quantity_reserved=2,
                quantity_total=16,
                district="Hyderabad",
                state="Telangana",
                latitude=17.4239,
                longitude=78.4738,
                last_updated_at=now,
            ),
        ]
        db.add_all(inventories)

        # ─── 6. Incident Reports ──────────────────────────────────────────────
        incidents = [
            IncidentReport(
                reference_number="DR360-2026-FL001",
                title="Severe Waterlogging and Submerged Underpass at Tolichowki",
                description="Underpass flooded up to 4 feet following intense storm. Multiple vehicles stranded. Water level rising steadily.",
                category=IncidentCategory.flooding,
                severity=IncidentSeverity.high,
                latitude=17.4012,
                longitude=78.4116,
                address="Tolichowki Flyover Underpass, Mehdipatnam Road",
                district="Hyderabad",
                state="Telangana",
                reported_at=now - timedelta(hours=2),
                reporter_id=citizen_user.id,
                reporter_name="Priya Sharma",
                status=IncidentStatus.in_progress,
            ),
            IncidentReport(
                reference_number="DR360-2026-TR002",
                title="Uprooted Banyan Tree Blocking Main Arterial Road",
                description="Massive tree branch collapsed onto 33kV overhead power lines, disrupting traffic and electricity in Srinagar Colony.",
                category=IncidentCategory.cyclone,
                severity=IncidentSeverity.medium,
                latitude=17.4265,
                longitude=78.4419,
                address="Road No. 10, Srinagar Colony, Banjara Hills",
                district="Hyderabad",
                state="Telangana",
                reported_at=now - timedelta(hours=5),
                status=IncidentStatus.acknowledged,
            ),
            IncidentReport(
                reference_number="DR360-2026-BD003",
                title="Structural Cracks Observed in Dilapidated Commercial Building",
                description="Heavy downpour triggered visible wall fissures and partial plaster collapse on 3rd floor. Evacuation precautionary alert required.",
                category=IncidentCategory.building_collapse,
                severity=IncidentSeverity.critical,
                latitude=17.3821,
                longitude=78.4812,
                address="Moazzam Jahi Market Lane, Abids",
                district="Hyderabad",
                state="Telangana",
                reported_at=now - timedelta(hours=1),
                status=IncidentStatus.pending_review,
            ),
            IncidentReport(
                reference_number="DR360-2026-FR004",
                title="Electrical Short Circuit Fire Extinguished at Malakpet",
                description="Distribution transformer fire near residential complex. Fire tender responded within 12 minutes. Situation fully safe.",
                category=IncidentCategory.fire,
                severity=IncidentSeverity.medium,
                latitude=17.3711,
                longitude=78.4989,
                address="Old Malakpet Gunj Road",
                district="Hyderabad",
                state="Telangana",
                reported_at=now - timedelta(days=1),
                status=IncidentStatus.resolved,
            ),
        ]
        db.add_all(incidents)
        await db.flush()

        # Add initial status histories for reports
        for inc in incidents:
            hist = IncidentStatusHistory(
                incident_id=inc.id,
                old_status=None,
                new_status=inc.status.value,
                changed_by_id=admin_user.id,
                reason="Initial seed dispatch",
                changed_at=inc.reported_at,
            )
            db.add(hist)

        # ─── 7. Sample NGO ───────────────────────────────────────────────────
        ngo = NGO(
            name="Red Cross Society — Telangana State Branch",
            registration_number="AP-HYD-1971-0042",
            description="Humanitarian emergency assistance, medical first aid camps, and disaster relief logistics.",
            mission="Preventing and alleviating human suffering during crises and natural calamities.",
            service_areas=["Hyderabad", "Ranga Reddy", "Medchal-Malkajgiri", "Warangal"],
            hazard_specialties=["flooding", "heat", "cyclone", "fire"],
            contact_name="Dr. K. Srinivas",
            contact_email="telangana@indianredcross.org",
            contact_phone="+91 40 2322 0925",
            website="https://indianredcross.org",
            is_verified=True,
            is_active=True,
        )
        db.add(ngo)

        await db.commit()
        print("✅ Seed completed successfully with verified users, incidents, alerts, services, and shelters!")


if __name__ == "__main__":
    asyncio.run(seed())
