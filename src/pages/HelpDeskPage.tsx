import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import HistoryIcon from '@mui/icons-material/History'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SearchIcon from '@mui/icons-material/Search'
import SortIcon from '@mui/icons-material/Sort'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import TuneIcon from '@mui/icons-material/Tune'
import { useTheme } from '@mui/material/styles'

type TicketStatus = 'Open' | 'In progress' | 'Waiting' | 'Resolved'
type TicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low'
type HelpDeskSection = 'tickets' | 'favorites' | 'queues' | 'wiki' | 'projects'

interface Activity {
  id: string
  author: string
  text: string
  date: string
}

interface Ticket {
  id: string
  subject: string
  requester: string
  requesterEmail: string
  technician: string
  location: string
  priority: TicketPriority
  status: TicketStatus
  category: string
  created: string
  updated: string
  notes: string
  favorite: boolean
  activities: Activity[]
}

interface SavedFilter {
  id: string
  name: string
  query: string
  status: TicketStatus | 'All'
  priority: TicketPriority | 'All'
}

const STORAGE_KEY = 'workthread-help-desk-v1'
const TECHNICIANS = ['Unassigned', 'Maya Patel', 'Jordan Lee', 'Chris Morgan', 'Avery Brooks']
const STATUSES: TicketStatus[] = ['Open', 'In progress', 'Waiting', 'Resolved']
const PRIORITIES: TicketPriority[] = ['Urgent', 'High', 'Medium', 'Low']

const SAMPLE_TICKETS: Ticket[] = [
  {
    id: 'HD-1048',
    subject: 'Branch 14 router dropping VPN connection',
    requester: 'Nina Alvarez',
    requesterEmail: 'nina.alvarez@contoso.example',
    technician: 'Maya Patel',
    location: 'Tampa, FL',
    priority: 'Urgent',
    status: 'In progress',
    category: 'Network',
    created: '2026-10-30',
    updated: '2026-11-02',
    notes: 'VPN drops every 20–30 minutes. Store remains open while the replacement router is staged.',
    favorite: true,
    activities: [
      { id: 'a1', author: 'Maya Patel', text: 'Replacement router staged for remote configuration.', date: 'Today, 08:42' },
      { id: 'a2', author: 'Nina Alvarez', text: 'Confirmed the issue affects all point-of-sale terminals.', date: 'Oct 31, 16:18' }
    ]
  },
  {
    id: 'HD-1047',
    subject: 'Cannot access quarterly sales dashboard',
    requester: 'Ethan Wright',
    requesterEmail: 'ethan.wright@contoso.example',
    technician: 'Jordan Lee',
    location: 'Orlando, FL',
    priority: 'High',
    status: 'Open',
    category: 'Access',
    created: '2026-11-01',
    updated: '2026-11-01',
    notes: 'User receives an access denied message after the dashboard moved to the new workspace.',
    favorite: false,
    activities: [{ id: 'a3', author: 'Jordan Lee', text: 'Requested a screenshot and the affected report URL.', date: 'Yesterday, 14:02' }]
  },
  {
    id: 'HD-1046',
    subject: 'New starter laptop and docking station',
    requester: 'Priya Shah',
    requesterEmail: 'priya.shah@contoso.example',
    technician: 'Avery Brooks',
    location: 'Miami, FL',
    priority: 'Medium',
    status: 'Waiting',
    category: 'Hardware',
    created: '2026-10-29',
    updated: '2026-10-31',
    notes: 'Laptop is ready. Waiting for the manager to confirm the new starter’s first day.',
    favorite: false,
    activities: [{ id: 'a4', author: 'Avery Brooks', text: 'Asset reserved: LT-4821 and DK-119.', date: 'Oct 31, 09:30' }]
  },
  {
    id: 'HD-1045',
    subject: 'Printer queue stuck on floor 3',
    requester: 'Marcus Chen',
    requesterEmail: 'marcus.chen@contoso.example',
    technician: 'Chris Morgan',
    location: 'Jacksonville, FL',
    priority: 'Low',
    status: 'Resolved',
    category: 'Hardware',
    created: '2026-10-27',
    updated: '2026-10-30',
    notes: 'Cleared a stale driver package and restarted the print spooler.',
    favorite: false,
    activities: [{ id: 'a5', author: 'Chris Morgan', text: 'Requester confirmed test page printed successfully.', date: 'Oct 30, 11:24' }]
  },
  {
    id: 'HD-1044',
    subject: 'Update MFA phone number',
    requester: 'Sam Rivera',
    requesterEmail: 'sam.rivera@contoso.example',
    technician: 'Maya Patel',
    location: 'Tallahassee, FL',
    priority: 'High',
    status: 'Open',
    category: 'Account',
    created: '2026-10-26',
    updated: '2026-10-29',
    notes: 'User changed phone carriers and needs the old number removed from MFA.',
    favorite: true,
    activities: []
  }
]

const SAMPLE_FILTERS: SavedFilter[] = [
  { id: 'mine', name: 'My open tickets', query: '', status: 'Open', priority: 'All' },
  { id: 'urgent', name: 'Urgent & high priority', query: '', status: 'All', priority: 'High' }
]

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return (parsed[key] as T) ?? fallback
  } catch {
    return fallback
  }
}

function formatRelativeDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`)
  const days = Math.round((Date.now() - parsed.getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function statusColor(status: TicketStatus): 'success' | 'info' | 'warning' | 'default' {
  if (status === 'Resolved') return 'success'
  if (status === 'In progress') return 'info'
  if (status === 'Waiting') return 'warning'
  return 'default'
}

function priorityColor(priority: TicketPriority): 'error' | 'warning' | 'info' | 'default' {
  if (priority === 'Urgent') return 'error'
  if (priority === 'High') return 'warning'
  if (priority === 'Medium') return 'info'
  return 'default'
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}): JSX.Element {
  return (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(event: SelectChangeEvent) => onChange(event.target.value)}>
        {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </Select>
    </FormControl>
  )
}

export default function HelpDeskPage(): JSX.Element {
  const theme = useTheme()
  const [tickets, setTickets] = useState<Ticket[]>(() => loadSaved('tickets', SAMPLE_TICKETS))
  const [filters, setFilters] = useState<SavedFilter[]>(() => loadSaved('filters', SAMPLE_FILTERS))
  const [section, setSection] = useState<HelpDeskSection>('tickets')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<TicketStatus | 'All'>('All')
  const [priority, setPriority] = useState<TicketPriority | 'All'>('All')
  const [technician, setTechnician] = useState('All')
  const [sortKey, setSortKey] = useState<keyof Ticket>('updated')
  const [sortAscending, setSortAscending] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showSaveFilter, setShowSaveFilter] = useState(false)
  const [newFilterName, setNewFilterName] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tickets, filters }))
  }, [tickets, filters])

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? null
  const counts = useMemo(() => ({
    all: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'Open').length,
    mine: tickets.filter((ticket) => ticket.technician === 'Maya Patel' && ticket.status !== 'Resolved').length,
    urgent: tickets.filter((ticket) => ticket.priority === 'Urgent').length
  }), [tickets])

  const visibleTickets = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = tickets.filter((ticket) => {
      const matchesQuery = !needle || [ticket.id, ticket.subject, ticket.requester, ticket.location, ticket.category]
        .join(' ').toLowerCase().includes(needle)
      const matchesStatus = status === 'All' || ticket.status === status
      const matchesPriority = priority === 'All' || ticket.priority === priority
      const matchesTechnician = technician === 'All' || ticket.technician === technician
      const matchesSection = section !== 'favorites' || ticket.favorite
      return matchesQuery && matchesStatus && matchesPriority && matchesTechnician && matchesSection
    })
    return [...filtered].sort((a, b) => {
      const left = String(a[sortKey])
      const right = String(b[sortKey])
      return (left.localeCompare(right, undefined, { numeric: true }) || a.id.localeCompare(b.id)) * (sortAscending ? 1 : -1)
    })
  }, [tickets, query, status, priority, technician, section, sortKey, sortAscending])

  function updateTicket(id: string, patch: Partial<Ticket>): void {
    setTickets((current) => current.map((ticket) => ticket.id === id ? { ...ticket, ...patch, updated: '2026-11-02' } : ticket))
  }

  function toggleSort(key: keyof Ticket): void {
    if (sortKey === key) setSortAscending((current) => !current)
    else {
      setSortKey(key)
      setSortAscending(true)
    }
  }

  function toggleSelection(id: string): void {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
  }

  function toggleAll(): void {
    setSelectedIds(selectedIds.length === visibleTickets.length ? [] : visibleTickets.map((ticket) => ticket.id))
  }

  function bulkStatus(nextStatus: TicketStatus): void {
    setTickets((current) => current.map((ticket) => selectedIds.includes(ticket.id) ? { ...ticket, status: nextStatus, updated: '2026-11-02' } : ticket))
    setSelectedIds([])
    setToast(`${selectedIds.length} ticket${selectedIds.length === 1 ? '' : 's'} updated`)
  }

  function createFilter(): void {
    if (!newFilterName.trim()) return
    const filter: SavedFilter = { id: `filter-${Date.now()}`, name: newFilterName.trim(), query, status, priority }
    setFilters((current) => [...current, filter])
    setActiveFilter(filter.id)
    setNewFilterName('')
    setShowSaveFilter(false)
  }

  function applyFilter(filter: SavedFilter): void {
    setQuery(filter.query)
    setStatus(filter.status)
    setPriority(filter.priority)
    setActiveFilter(filter.id)
    setSection('tickets')
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', minHeight: 0, bgcolor: 'background.default' }}>
      <Box sx={{ width: 220, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper', p: 1.5, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 1 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Help Desk</Typography>
            <Typography variant="caption" color="text.secondary">Operations workspace</Typography>
          </Box>
          <Tooltip title="Workspace options"><IconButton size="small"><MoreHorizIcon /></IconButton></Tooltip>
        </Stack>
        <Button fullWidth variant="contained" startIcon={<AddIcon />} sx={{ my: 1.5 }} onClick={() => {
          const newTicket: Ticket = { ...SAMPLE_TICKETS[0], id: `HD-${1050 + tickets.length}`, subject: 'New help desk request', status: 'Open', priority: 'Medium', technician: 'Unassigned', favorite: false, activities: [], created: '2026-11-02', updated: '2026-11-02' }
          setTickets((current) => [newTicket, ...current])
          setSelectedId(newTicket.id)
        }}>New ticket</Button>
        <List dense disablePadding>
          {[
            { id: 'tickets' as const, label: 'All tickets', icon: <InboxOutlinedIcon />, count: counts.all },
            { id: 'favorites' as const, label: 'Favorites', icon: <StarBorderIcon />, count: tickets.filter((ticket) => ticket.favorite).length },
            { id: 'queues' as const, label: 'Queues', icon: <TaskAltIcon />, count: counts.open },
            { id: 'wiki' as const, label: 'Team wiki', icon: <DescriptionOutlinedIcon /> },
            { id: 'projects' as const, label: 'Projects', icon: <FolderOpenOutlinedIcon /> }
          ].map((item) => (
            <ListItemButton key={item.id} selected={section === item.id} onClick={() => setSection(item.id)} sx={{ borderRadius: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {item.count !== undefined && <Typography variant="caption" color="text.secondary">{item.count}</Typography>}
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>Saved filters</Typography>
        <List dense disablePadding>
          {filters.map((filter) => (
            <ListItemButton key={filter.id} selected={activeFilter === filter.id} onClick={() => applyFilter(filter)} sx={{ borderRadius: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}><BookmarkBorderIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={filter.name} primaryTypographyProps={{ noWrap: true, fontSize: 13 }} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ mt: 'auto', pt: 3, px: 1 }}>
          <Typography variant="caption" color="text.secondary">Connected locally</Typography>
          <Typography variant="caption" display="block" color="text.secondary">SharePoint integration can be added later.</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {section === 'wiki' ? (
          <WikiPanel />
        ) : section === 'projects' ? (
          <ProjectsPanel tickets={tickets} />
        ) : section === 'queues' ? (
          <QueuesPanel counts={counts} onOpenQueue={(nextStatus) => { setStatus(nextStatus); setSection('tickets') }} />
        ) : (
          <>
            <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={1}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{section === 'favorites' ? 'Favorite tickets' : 'All tickets'}</Typography>
                  <Typography variant="body2" color="text.secondary">Track requests, route work, and keep every update in one place.</Typography>
                </Box>
                <Stack direction="row" gap={1}>
                  <Button size="small" startIcon={<BookmarkBorderIcon />} onClick={() => setShowSaveFilter(true)}>Save filter</Button>
                  <Button size="small" variant="outlined" startIcon={<FilterAltOutlinedIcon />} onClick={() => setShowFilters((current) => !current)}>Filters</Button>
                </Stack>
              </Stack>
              <Tabs value={status} onChange={(_, value: TicketStatus | 'All') => setStatus(value)} sx={{ mt: 2 }} variant="scrollable">
                {['All', ...STATUSES].map((tab) => <Tab key={tab} value={tab} label={tab === 'All' ? `All (${counts.all})` : tab} />)}
              </Tabs>
            </Box>
            <Paper square variant="outlined" sx={{ mx: 3, mb: 3, overflow: 'hidden' }}>
              <Toolbar sx={{ gap: 1, flexWrap: 'wrap', px: 1.5 }}>
                <TextField size="small" placeholder="Search tickets" value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ width: 280 }} />
                {showFilters && <>
                  <SelectField label="Priority" value={priority} options={['All', ...PRIORITIES]} onChange={(value) => setPriority(value as TicketPriority | 'All')} />
                  <SelectField label="Technician" value={technician} options={['All', ...TECHNICIANS]} onChange={setTechnician} />
                  <Button size="small" onClick={() => { setQuery(''); setStatus('All'); setPriority('All'); setTechnician('All'); setActiveFilter(null) }}>Clear</Button>
                </>}
                <Box sx={{ flex: 1 }} />
                {selectedIds.length > 0 && <>
                  <Typography variant="body2" color="text.secondary">{selectedIds.length} selected</Typography>
                  <SelectField label="Bulk status" value="" options={['Choose status', ...STATUSES]} onChange={(value) => value !== 'Choose status' && bulkStatus(value as TicketStatus)} />
                </>}
                <Tooltip title="Customize columns"><IconButton size="small"><TuneIcon /></IconButton></Tooltip>
              </Toolbar>
              <TableContainer>
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell padding="checkbox"><Checkbox size="small" checked={visibleTickets.length > 0 && selectedIds.length === visibleTickets.length} indeterminate={selectedIds.length > 0 && selectedIds.length < visibleTickets.length} onChange={toggleAll} /></TableCell>
                      <TableCell width={110}>ID</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Requester</TableCell>
                      <TableCell>Technician</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell><Button size="small" onClick={() => toggleSort('priority')} endIcon={sortKey === 'priority' ? <SortIcon fontSize="small" /> : undefined}>Priority</Button></TableCell>
                      <TableCell><Button size="small" onClick={() => toggleSort('status')} endIcon={sortKey === 'status' ? <SortIcon fontSize="small" /> : undefined}>Status</Button></TableCell>
                      <TableCell><Button size="small" onClick={() => toggleSort('updated')} endIcon={sortKey === 'updated' ? <SortIcon fontSize="small" /> : undefined}>Updated</Button></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleTickets.map((ticket) => (
                      <TableRow key={ticket.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedId(ticket.id)}>
                        <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}><Checkbox size="small" checked={selectedIds.includes(ticket.id)} onChange={() => toggleSelection(ticket.id)} /></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={700} color="primary">{ticket.id}</Typography></TableCell>
                        <TableCell><Stack direction="row" alignItems="center" gap={1}><IconButton size="small" onClick={(event) => { event.stopPropagation(); updateTicket(ticket.id, { favorite: !ticket.favorite }) }}>{ticket.favorite ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}</IconButton><Box><Typography variant="body2" fontWeight={600}>{ticket.subject}</Typography><Typography variant="caption" color="text.secondary">{ticket.category}</Typography></Box></Stack></TableCell>
                        <TableCell><Typography variant="body2">{ticket.requester}</Typography><Typography variant="caption" color="text.secondary">{ticket.requesterEmail}</Typography></TableCell>
                        <TableCell><Stack direction="row" alignItems="center" gap={0.75}><Avatar sx={{ width: 24, height: 24, fontSize: 11 }}>{ticket.technician === 'Unassigned' ? '?' : ticket.technician.split(' ').map((part) => part[0]).join('')}</Avatar><Typography variant="body2">{ticket.technician}</Typography></Stack></TableCell>
                        <TableCell><Stack direction="row" gap={0.5} alignItems="center"><LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} /><Typography variant="body2">{ticket.location}</Typography></Stack></TableCell>
                        <TableCell><Chip size="small" label={ticket.priority} color={priorityColor(ticket.priority)} variant={ticket.priority === 'Urgent' ? 'filled' : 'outlined'} /></TableCell>
                        <TableCell><Chip size="small" label={ticket.status} color={statusColor(ticket.status)} variant="outlined" /></TableCell>
                        <TableCell><Typography variant="body2">{formatRelativeDate(ticket.updated)}</Typography></TableCell>
                      </TableRow>
                    ))}
                    {visibleTickets.length === 0 && <TableRow><TableCell colSpan={9}><Box sx={{ py: 8, textAlign: 'center' }}><SearchIcon color="disabled" sx={{ fontSize: 40 }} /><Typography>No tickets match these filters.</Typography><Button onClick={() => { setQuery(''); setStatus('All'); setPriority('All'); setTechnician('All') }}>Clear filters</Button></Box></TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>

      <TicketDrawer ticket={selectedTicket} onClose={() => setSelectedId(null)} onUpdate={updateTicket} />
      <Dialog open={showSaveFilter} onClose={() => setShowSaveFilter(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Save current filter</DialogTitle>
        <DialogContent><TextField autoFocus fullWidth label="Filter name" value={newFilterName} onChange={(event) => setNewFilterName(event.target.value)} sx={{ mt: 1 }} /></DialogContent>
        <DialogActions><Button onClick={() => setShowSaveFilter(false)}>Cancel</Button><Button variant="contained" onClick={createFilter}>Save</Button></DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
    </Box>
  )
}

function TicketDrawer({ ticket, onClose, onUpdate }: { ticket: Ticket | null; onClose: () => void; onUpdate: (id: string, patch: Partial<Ticket>) => void }): JSX.Element {
  const [note, setNote] = useState('')
  useEffect(() => setNote(ticket?.notes ?? ''), [ticket])
  return (
    <Drawer anchor="right" open={!!ticket} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 460 } } }}>
      {ticket && <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="overline" color="primary">{ticket.id}</Typography><Typography variant="h6" fontWeight={700}>{ticket.subject}</Typography></Box><IconButton onClick={onClose}><CloseIcon /></IconButton></Stack>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}><Chip size="small" label={ticket.status} color={statusColor(ticket.status)} /><Chip size="small" label={ticket.priority} color={priorityColor(ticket.priority)} variant="outlined" /></Stack>
        </Box>
        <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
          <Stack spacing={2}>
            <Stack direction="row" gap={1.5} alignItems="center"><Avatar>{ticket.requester.split(' ').map((part) => part[0]).join('')}</Avatar><Box><Typography fontWeight={600}>{ticket.requester}</Typography><Typography variant="body2" color="text.secondary">{ticket.requesterEmail}</Typography></Box></Stack>
            <Stack direction="row" gap={1}><LocationOnOutlinedIcon color="action" /><Typography>{ticket.location}</Typography></Stack>
            <SelectField label="Technician" value={ticket.technician} options={TECHNICIANS} onChange={(value) => onUpdate(ticket.id, { technician: value })} />
            <SelectField label="Priority" value={ticket.priority} options={PRIORITIES} onChange={(value) => onUpdate(ticket.id, { priority: value as TicketPriority })} />
            <SelectField label="Status" value={ticket.status} options={STATUSES} onChange={(value) => onUpdate(ticket.id, { status: value as TicketStatus })} />
            <TextField label="Requester" value={ticket.requester} onChange={(event) => onUpdate(ticket.id, { requester: event.target.value })} size="small" fullWidth />
            <TextField label="Location" value={ticket.location} onChange={(event) => onUpdate(ticket.id, { location: event.target.value })} size="small" fullWidth />
            <TextField label="Notes" value={note} onChange={(event) => setNote(event.target.value)} onBlur={() => onUpdate(ticket.id, { notes: note })} multiline minRows={4} fullWidth />
            <Divider />
            <Typography variant="subtitle2">Activity history</Typography>
            {ticket.activities.length === 0 && <Typography variant="body2" color="text.secondary">No activity yet.</Typography>}
            {ticket.activities.map((activity) => <Stack key={activity.id} direction="row" gap={1.5}><Avatar sx={{ width: 28, height: 28, fontSize: 11 }}>{activity.author.split(' ').map((part) => part[0]).join('')}</Avatar><Box><Typography variant="body2"><b>{activity.author}</b> {activity.text}</Typography><Typography variant="caption" color="text.secondary">{activity.date}</Typography></Box></Stack>)}
          </Stack>
        </Box>
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}><Button fullWidth variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={() => onUpdate(ticket.id, { status: 'Resolved' })}>Mark resolved</Button></Box>
      </Box>}
    </Drawer>
  )
}

function QueuesPanel({ counts, onOpenQueue }: { counts: { all: number; open: number; mine: number; urgent: number }; onOpenQueue: (status: TicketStatus) => void }): JSX.Element {
  const queues = [
    { title: 'Unassigned queue', description: 'Tickets that need an owner', count: counts.open, icon: <PersonOutlineIcon />, status: 'Open' as TicketStatus },
    { title: 'My open tickets', description: 'Assigned to Maya Patel', count: counts.mine, icon: <InboxOutlinedIcon />, status: 'Open' as TicketStatus },
    { title: 'Urgent attention', description: 'Requests affecting operations', count: counts.urgent, icon: <TaskAltIcon />, status: 'Open' as TicketStatus }
  ]
  return <Box sx={{ p: 3 }}><Typography variant="h5" fontWeight={700}>Queues</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Simple views for the work that needs attention now.</Typography><Stack direction={{ xs: 'column', md: 'row' }} gap={2}>{queues.map((queue) => <Paper key={queue.title} variant="outlined" sx={{ p: 2.5, width: { md: 280 } }}><Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>{queue.icon}</Avatar><Typography variant="h6">{queue.title}</Typography><Typography variant="body2" color="text.secondary">{queue.description}</Typography><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}><Typography variant="h4" fontWeight={700}>{queue.count}</Typography><Button onClick={() => onOpenQueue(queue.status)}>View queue</Button></Stack></Paper>)}</Stack></Box>
}

function ProjectsPanel({ tickets }: { tickets: Ticket[] }): JSX.Element {
  const routerTickets = tickets.filter((ticket) => ticket.subject.toLowerCase().includes('router'))
  return <Box sx={{ p: 3 }}><Typography variant="h5" fontWeight={700}>Projects</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Coordinate larger operational work across related tickets.</Typography><Paper variant="outlined" sx={{ p: 2.5, maxWidth: 760 }}><Stack direction="row" gap={2} alignItems="flex-start"><Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}><FolderOpenOutlinedIcon /></Avatar><Box sx={{ flex: 1 }}><Stack direction="row" justifyContent="space-between"><Box><Typography variant="h6">Florida router refresh</Typography><Typography variant="body2" color="text.secondary">Update 32 branch routers across Florida</Typography></Box><Chip label="In progress" color="info" size="small" /></Stack><Box sx={{ mt: 2, height: 8, bgcolor: 'action.hover', borderRadius: 4 }}><Box sx={{ width: '59%', height: '100%', bgcolor: 'primary.main', borderRadius: 4 }} /></Box><Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}><Typography variant="caption" color="text.secondary">19 of 32 complete</Typography><Typography variant="caption" color="text.secondary">{routerTickets.length} linked tickets</Typography></Stack><Divider sx={{ my: 2 }} /><Stack direction="row" gap={3}><Box><Typography variant="caption" color="text.secondary">Owner</Typography><Typography variant="body2">Maya Patel</Typography></Box><Box><Typography variant="caption" color="text.secondary">Target</Typography><Typography variant="body2">Dec 18, 2026</Typography></Box><Box><Typography variant="caption" color="text.secondary">Region</Typography><Typography variant="body2">Florida</Typography></Box></Stack></Box></Stack></Paper></Box>
}

function WikiPanel(): JSX.Element {
  return <Box sx={{ p: 3 }}><Typography variant="h5" fontWeight={700}>Team wiki</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Quick references for technicians and requesters.</Typography><Stack direction={{ xs: 'column', md: 'row' }} gap={2}><Paper variant="outlined" sx={{ p: 2.5, maxWidth: 360 }}><DescriptionOutlinedIcon color="primary" /><Typography variant="h6" sx={{ mt: 1 }}>Router replacement runbook</Typography><Typography variant="body2" color="text.secondary">Branch checklist, staging steps, and escalation contacts.</Typography><Button sx={{ mt: 2 }}>Open article</Button></Paper><Paper variant="outlined" sx={{ p: 2.5, maxWidth: 360 }}><HistoryIcon color="primary" /><Typography variant="h6" sx={{ mt: 1 }}>On-call handoff</Typography><Typography variant="body2" color="text.secondary">Document active incidents and anything the next shift needs to know.</Typography><Button sx={{ mt: 2 }}>Open article</Button></Paper></Stack></Box>
}
